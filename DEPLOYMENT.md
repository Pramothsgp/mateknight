# Deploying Chess 3D to Google Cloud Run

This guide explains how the Chess 3D app is containerized and deployed to Google Cloud Run, covering every file and command involved.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Files Involved](#files-involved)
3. [Dockerfile Explained](#dockerfile-explained)
4. [.dockerignore Explained](#dockerignore-explained)
5. [Health Check Endpoint](#health-check-endpoint)
6. [cloudbuild.yaml Explained](#cloudbuildyaml-explained)
7. [GCP Setup (One-Time)](#gcp-setup-one-time)
8. [Deploying](#deploying)
9. [How Cloud Run Works With This App](#how-cloud-run-works-with-this-app)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
                          Cloud Run
                    ┌─────────────────────┐
  User Browser ───> │  Bun Runtime         │
                    │  ┌────────────────┐  │
                    │  │  server.ts      │  │
                    │  │  (HTTP Server)  │  │
                    │  │                 │  │
  HTTP requests ──> │  │  Next.js ◄──────│──│── Serves pages, API routes
                    │  │                 │  │
  WebSocket ──────> │  │  Socket.IO ◄────│──│── Real-time game events
                    │  └────────────────┘  │
                    └─────────────────────┘
```

The app runs a single HTTP server (via `server.ts`) that handles both:
- **Next.js** requests (pages, static assets, API routes)
- **Socket.IO** WebSocket connections (real-time chess game moves)

Cloud Run runs this as a Docker container, auto-scaling based on traffic.

---

## Files Involved

| File | Purpose |
|------|---------|
| `Dockerfile` | Instructions to build the Docker container image |
| `.dockerignore` | Files to exclude from the Docker build context |
| `apps/web/src/app/api/health/route.ts` | Health check endpoint for Cloud Run |
| `cloudbuild.yaml` | CI/CD pipeline config for Google Cloud Build |

---

## Dockerfile Explained

The Dockerfile uses a **multi-stage build** — three separate stages that each start from a clean base image. This keeps the final image small by only including what's needed at runtime.

### Stage 1: `deps` — Install Dependencies

```dockerfile
FROM oven/bun:1.3.9-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN bun install --frozen-lockfile
```

**What it does:**
- Starts from the official Bun 1.3.9 image (Alpine Linux variant — small footprint)
- Copies only `package.json` and lock files first (not source code)
- Runs `bun install` to download all dependencies (dev + production)

**Why copy package files separately?** Docker caches each step (layer). If source code changes but `package.json` doesn't, Docker reuses the cached `node_modules` instead of reinstalling — making rebuilds much faster.

### Stage 2: `builder` — Build the App

```dockerfile
FROM oven/bun:1.3.9-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY . .

RUN cd packages/shared && bun run build    # Compiles TypeScript types -> dist/
RUN cd apps/web && bun run build           # Runs `next build` -> .next/
```

**What it does:**
- Copies the installed `node_modules` from Stage 1
- Copies all source code
- Builds the shared package first (the web app depends on it)
- Builds the Next.js app (compiles pages, optimizes bundles)

**Build order matters:** The shared package (`@chess/shared`) exports types and constants used by the web app. It must be compiled before `next build` runs.

### Stage 3: `runner` — Production Image

```dockerfile
FROM oven/bun:1.3.9-alpine AS runner
WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV PORT=8080
```

**Why `WORKDIR /app/apps/web`?** Next.js looks for the `.next/` build folder relative to the current working directory. Since `server.ts` calls `next({ dev: false })`, Next.js expects `.next/` to be in the same directory.

```dockerfile
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
```

**Security:** Creates a non-root user. Running as root inside a container is a security risk — if the app is compromised, the attacker gets root access to the container.

```dockerfile
COPY package.json bun.lock /app/
COPY apps/web/package.json ./
COPY packages/shared/package.json /app/packages/shared/

RUN cd /app && bun install --frozen-lockfile --production
```

**`--production` flag:** Installs only production dependencies, excluding devDependencies like TypeScript, type definitions, and drizzle-kit. This reduces image size.

```dockerfile
# Copy only what's needed at runtime
COPY --from=builder /app/packages/shared/dist /app/packages/shared/dist
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/server.ts ./server.ts
COPY --from=builder /app/apps/web/server ./server
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/next.config.mjs ./next.config.mjs
```

**Selective copying:** Only the build output and runtime files are copied from the builder stage. Source code (`src/`), TypeScript configs, and build tooling are left behind.

```dockerfile
USER nextjs
EXPOSE 8080
CMD ["bun", "server.ts"]
```

**`CMD`:** The command that runs when the container starts. Bun executes `server.ts` directly (it transpiles TypeScript on-the-fly). This starts the HTTP server that serves both Next.js and Socket.IO.

---

## .dockerignore Explained

Similar to `.gitignore`, this tells Docker which files to **exclude** when building. Without it, Docker would send everything (including `node_modules/` which can be 500MB+) to the build engine, making builds slow.

Key exclusions:
- `node_modules/` — reinstalled inside the container
- `.next/` — rebuilt inside the container
- `.git/` — not needed in the image
- `.env*` — secrets must never be baked into images

---

## Health Check Endpoint

**File:** `apps/web/src/app/api/health/route.ts`

```typescript
export function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

**Why it exists:** Cloud Run periodically pings this endpoint to check if the container is healthy. If it returns a non-200 response, Cloud Run restarts the container.

**Why a Next.js API route (not a raw handler)?** This confirms that the entire stack is working — both the HTTP server AND Next.js. A raw handler in `server.ts` would only confirm the HTTP server is up.

**Test it:** `curl http://localhost:8080/api/health`

---

## cloudbuild.yaml Explained

This file defines a CI/CD pipeline that Google Cloud Build executes. It has three steps:

### Step 1: Build the Docker Image

```yaml
- name: "gcr.io/cloud-builders/docker"
  args: ["build", "-t", "${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_IMAGE}:${_TAG}", ...]
```

Runs `docker build` in the cloud using the project's Dockerfile. Tags the image with both a version tag and `latest`.

### Step 2: Push the Image

```yaml
- name: "gcr.io/cloud-builders/docker"
  args: ["push", "--all-tags", ...]
```

Pushes the built image to **Artifact Registry** — Google's container image storage. Cloud Run pulls from here when deploying.

### Step 3: Deploy to Cloud Run

```yaml
- name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
  entrypoint: "gcloud"
  args: ["run", "deploy", "chess-3d", "--image", "...", ...]
```

Deploys the image to Cloud Run with specific configuration flags (explained below).

### Substitution Variables

```yaml
substitutions:
  _REGION: asia-south1
  _REPO: chess-repo
  _IMAGE: app
  _TAG: latest
```

These are variables that get replaced throughout the file. You can override them at deploy time:

```bash
# Deploy with a specific version tag
gcloud builds submit --config cloudbuild.yaml --substitutions=_TAG=v2.0.0
```

### Cloud Run Flags

| Flag | Value | Why |
|------|-------|-----|
| `--port 8080` | 8080 | The port the container listens on (set via `ENV PORT=8080` in Dockerfile) |
| `--session-affinity` | enabled | Routes the same client to the same container instance (required for Socket.IO — see below) |
| `--max-instances 5` | 5 | Limits how many containers can run simultaneously (controls cost) |
| `--memory 512Mi` | 512MB | RAM per container instance |
| `--cpu 1` | 1 vCPU | CPU per container instance |
| `--timeout 3600` | 1 hour | Maximum request duration (WebSocket connections stay open this long) |
| `--allow-unauthenticated` | enabled | Anyone can access the app (no Google login required) |

---

## GCP Setup (One-Time)

These commands only need to be run once to set up the Google Cloud infrastructure.

### 1. Install and authenticate the gcloud CLI

```bash
# Install: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project chess-487715
```

### 2. Enable required APIs

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com
```

- **Cloud Build API** — builds Docker images in the cloud
- **Cloud Run API** — runs containers
- **Artifact Registry API** — stores container images

### 3. Create an Artifact Registry repository

```bash
gcloud artifacts repositories create chess-repo \
  --repository-format=docker \
  --location=asia-south1
```

This creates a place to store Docker images, similar to Docker Hub but private to your GCP project.

### 4. Configure Docker to authenticate with Artifact Registry

```bash
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

This tells your local Docker to use your Google credentials when pushing/pulling images.

---

## Deploying

### Option A: Cloud Build (Recommended)

Single command that builds, pushes, and deploys:

```bash
gcloud builds submit --config cloudbuild.yaml
```

The build runs on Google's servers, so it works regardless of your local machine's specs.

### Option B: Manual Build and Deploy

If you prefer building locally:

```bash
# Build
docker build -t asia-south1-docker.pkg.dev/chess-487715/chess-repo/app .

# Push
docker push asia-south1-docker.pkg.dev/chess-487715/chess-repo/app

# Deploy
gcloud run deploy chess-3d \
  --image asia-south1-docker.pkg.dev/chess-487715/chess-repo/app \
  --region asia-south1 \
  --port 8080 \
  --session-affinity \
  --max-instances 5 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production"
```

### Testing Locally Before Deploying

```bash
docker build -t chess-3d .
docker run -p 8080:8080 chess-3d
# Visit http://localhost:8080
```

---

## How Cloud Run Works With This App

### Session Affinity (Sticky Sessions)

Socket.IO connects in two phases:
1. HTTP long-polling handshake (creates a session)
2. Upgrade to WebSocket

If step 1 goes to Container A but step 2 goes to Container B, the connection fails. **Session affinity** ensures the same client always reaches the same container by setting a cookie.

### Scaling Behavior

- **Min instances: 0** — When no one is playing, Cloud Run scales to zero (no cost). The trade-off is a cold start delay of ~5-10 seconds for the first request.
- **Max instances: 5** — Limits the number of running containers to control cost.

### WebSocket Timeout

Cloud Run allows WebSocket connections to stay open for up to 1 hour (`--timeout 3600`). After that, the connection drops. The app's built-in reconnection logic automatically reconnects players and restores their game state.

### In-Memory Game State

Game state (active rooms, board positions) lives in the server's memory. This means:
- **Redeployments** clear all active games
- **Scaling to zero** loses all game state
- Each container instance has its own isolated game state

For a production system, you would persist game state to the database.

---

## Troubleshooting

### Build fails with "Could not find production build in .next"
The `WORKDIR` in the runner stage must be `/app/apps/web` so Next.js can find `.next/` relative to the working directory.

### Build fails with "npm not found" / TypeScript install error
The config file must be `next.config.mjs` (not `.ts`). Next.js tries to install TypeScript at runtime if it sees a `.ts` config, but `npm` isn't available in the Bun image.

### `$COMMIT_SHA` empty error
When running `gcloud builds submit` manually (not from a Git trigger), `$COMMIT_SHA` is empty. The `_TAG` substitution variable defaults to `latest` to handle this. Override it with `--substitutions=_TAG=v1.0.0` for versioned deploys.

### Socket.IO connections failing
Ensure `--session-affinity` is enabled on the Cloud Run service. Without it, the polling-to-WebSocket upgrade fails when routed to different instances.

### Cold start taking too long
With `min-instances 0`, the first request after idle spins up a new container (~5-10s). Set `--min-instances 1` in the deploy command if you need instant responses (adds cost for always-on instance).
