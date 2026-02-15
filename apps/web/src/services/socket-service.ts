"use client";

import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@chess/shared";
import { ServerEvents } from "@chess/shared";
import { useGameStore } from "@/store/game-store";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
    });
    registerListeners(socket);
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
    useGameStore.setState({ connected: true });
    console.log("[Socket] Connected:", socket!.id);
  });

  socket.on("disconnect", () => {
    useGameStore.setState({ connected: false });
    console.log("[Socket] Disconnected");
  });

  socket.on("connect_error", (err) => {
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
