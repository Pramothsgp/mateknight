import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@chess/shared";
import { setupSocketHandlers } from "./server/socket-handlers.js";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer();

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/socket.io",
    addTrailingSlash: false,
    cors: dev
      ? { origin: "*", methods: ["GET", "POST"] }
      : undefined,
  });

  setupSocketHandlers(io);

  // Let Next.js handle all non-socket requests
  httpServer.on("request", (req, res) => {
    if (req.url?.startsWith("/socket.io")) return;
    handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Server listening on http://localhost:${port} (${dev ? "development" : "production"})`);
  });
});
