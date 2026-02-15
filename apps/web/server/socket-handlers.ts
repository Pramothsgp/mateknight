import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@chess/shared";
import { ClientEvents, ServerEvents, RECONNECT_TIMEOUT_SECONDS } from "@chess/shared";
import { gameManager } from "./game-manager.js";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(io: TypedServer) {
  io.on("connection", (socket: TypedSocket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on(ClientEvents.CREATE_ROOM, (payload) => {
      const { roomId, playerColor } = gameManager.createRoom(socket.id, payload.playerName);
      socket.join(roomId);

      socket.emit(ServerEvents.ROOM_CREATED, { roomId, playerColor });
      console.log(`[Room] Created: ${roomId} by ${payload.playerName} as ${playerColor}`);
    });

    socket.on(ClientEvents.JOIN_ROOM, (payload) => {
      const result = gameManager.joinRoom(payload.roomId, socket.id, payload.playerName);

      if (!result.success) {
        socket.emit(ServerEvents.ERROR, { message: result.error! });
        return;
      }

      socket.join(payload.roomId);

      // Notify both players that the game has started
      const room = gameManager.getRoom(payload.roomId);
      if (room && result.gameState && result.players) {
        for (const player of room.players) {
          const playerColor = player.color;
          io.to(player.socketId).emit(ServerEvents.GAME_START, {
            gameState: result.gameState,
            players: result.players,
            yourColor: playerColor,
          });
        }
      }

      console.log(`[Room] ${payload.playerName} joined ${payload.roomId}`);
    });

    socket.on(ClientEvents.MAKE_MOVE, (payload) => {
      const result = gameManager.makeMove(payload.gameId, socket.id, payload);

      if (!result.success) {
        socket.emit(ServerEvents.MOVE_REJECTED, { reason: result.error! });
        return;
      }

      const roomId = gameManager.getRoomForSocket(socket.id);
      if (!roomId) return;

      // Broadcast confirmed move to both players
      io.to(roomId).emit(ServerEvents.MOVE_CONFIRMED, {
        move: result.moveRecord!,
        gameState: result.gameState!,
      });

      // If game over, broadcast that too
      if (result.gameOver) {
        io.to(roomId).emit(ServerEvents.GAME_OVER, {
          status: result.gameOver.status,
          winner: result.gameOver.winner,
          reason: result.gameOver.reason,
        });
      }
    });

    socket.on(ClientEvents.RESIGN, (payload) => {
      const result = gameManager.resign(payload.gameId, socket.id);

      if (!result.success) {
        socket.emit(ServerEvents.ERROR, { message: result.error! });
        return;
      }

      const roomId = gameManager.getRoomForSocket(socket.id);
      if (!roomId) return;

      io.to(roomId).emit(ServerEvents.GAME_OVER, {
        status: "resigned",
        winner: result.winner,
        reason: "Opponent resigned",
      });
    });

    socket.on(ClientEvents.REQUEST_SYNC, (payload) => {
      const gameState = gameManager.getGameState(payload.gameId);
      if (!gameState) {
        socket.emit(ServerEvents.ERROR, { message: "Game not found" });
        return;
      }

      const roomId = gameManager.getRoomForSocket(socket.id);
      if (!roomId) return;

      const players = gameManager.getRoomPlayers(roomId);
      const yourColor = gameManager.getPlayerColor(roomId, socket.id);
      if (!yourColor) return;

      socket.emit(ServerEvents.STATE_SYNC, {
        gameState,
        players,
        yourColor,
      });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      const info = gameManager.handleDisconnect(socket.id);

      if (info && info.opponentSocketId) {
        io.to(info.opponentSocketId).emit(ServerEvents.OPPONENT_DISCONNECTED, {
          playerName: info.playerName!,
          timeoutSeconds: RECONNECT_TIMEOUT_SECONDS,
        });
      }
    });
  });
}
