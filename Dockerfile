# ============================================================
# Stage 1: Install all dependencies
# ============================================================
FROM oven/bun:1.3.9-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN bun install --frozen-lockfile

# ============================================================
# Stage 2: Build the application
# ============================================================
FROM oven/bun:1.3.9-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY . .

# Build shared package (tsc -> dist/)
RUN cd packages/shared && bun run build

# Build Next.js app
RUN cd apps/web && bun run build

# ============================================================
# Stage 3: Production runtime
# ============================================================
FROM oven/bun:1.3.9-alpine AS runner

# WORKDIR must be apps/web so Next.js finds .next/ relative to cwd
WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy workspace root package files for bun install
COPY package.json bun.lock /app/
COPY apps/web/package.json ./
COPY packages/shared/package.json /app/packages/shared/

# Install production dependencies from workspace root
RUN cd /app && bun install --frozen-lockfile --production

# Copy built shared package
COPY --from=builder /app/packages/shared/dist /app/packages/shared/dist
COPY --from=builder /app/packages/shared/package.json /app/packages/shared/package.json

# Copy Next.js build output
COPY --from=builder /app/apps/web/.next ./.next

# Copy custom server and server-side code
COPY --from=builder /app/apps/web/server.ts ./server.ts
COPY --from=builder /app/apps/web/server ./server

# Copy public assets (3D models, static files)
COPY --from=builder /app/apps/web/public ./public

# Copy next.config (needed at runtime)
COPY --from=builder /app/apps/web/next.config.mjs ./next.config.mjs

RUN chown -R nextjs:nodejs ./.next

USER nextjs

EXPOSE 8080

CMD ["bun", "server.ts"]
