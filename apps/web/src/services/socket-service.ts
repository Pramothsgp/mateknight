"use client";

import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@chess/shared";
import { ServerEvents } from "@chess/shared";
import { useGameStore } from "@/store/game-store";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;
let connectionError: string | null = null;

export function getConnectionError(): string | null {
  return connectionError;
}

export async function initSocket(): Promise<TypedSocket> {
  if (socket) return socket;

  try {
    const { io } = await import("socket.io-client");
    socket = io({
      transports: ["polling", "websocket"],
    });
    registerListeners(socket);
    connectionError = null;
    return socket;
  } catch (err) {
    connectionError = err instanceof Error ? err.message : "Failed to init socket";
    throw err;
  }
}

export function getSocket(): TypedSocket {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket() first.");
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

function registerListeners(socket: TypedSocket) {
  const store = useGameStore.getState;

  socket.on("connect", () => {
    connectionError = null;
    useGameStore.setState({ connected: true, socketError: null });
    console.log("[Socket] Connected:", socket!.id);
  });

  socket.on("disconnect", () => {
    useGameStore.setState({ connected: false });
    console.log("[Socket] Disconnected");
  });

  socket.on("connect_error", (err) => {
    connectionError = err.message;
    useGameStore.setState({ socketError: err.message });
    console.error("[Socket] Connection error:", err.message);
  });

  socket.on(ServerEvents.ROOM_CREATED, (payload) => {
    store().onRoomCreated(payload.roomId, payload.playerColor);
  });

  socket.on(ServerEvents.GAME_START, (payload) => {
    store().onGameStart(payload.gameState, payload.players, payload.yourColor);
  });

  socket.on(ServerEvents.MOVE_CONFIRMED, (payload) => {
    store().onMoveConfirmed(payload.move, payload.gameState);
  });

  socket.on(ServerEvents.MOVE_REJECTED, (payload) => {
    store().onMoveRejected(payload.reason);
  });

  socket.on(ServerEvents.GAME_OVER, (payload) => {
    store().onGameOver(payload.status, payload.winner, payload.reason);
  });

  socket.on(ServerEvents.STATE_SYNC, (payload) => {
    store().onStateSync(payload.gameState, payload.players, payload.yourColor);
  });

  socket.on(ServerEvents.ERROR, (payload) => {
    store().onError(payload.message);
  });

  socket.on(ServerEvents.OPPONENT_DISCONNECTED, (payload) => {
    store().onOpponentDisconnected(payload.playerName, payload.timeoutSeconds);
  });

  socket.on(ServerEvents.OPPONENT_RECONNECTED, (payload) => {
    store().onOpponentReconnected(payload.playerName);
  });
}
