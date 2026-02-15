import { Chess } from "chess.js";
import type {
  PieceColor,
  GameState,
  GameStatus,
  MoveRecord,
  MovePayload,
  PlayerInfo,
} from "@chess/shared";
import { RECONNECT_TIMEOUT_SECONDS } from "@chess/shared";
import { generateRoomId, generateGameId, randomColor } from "./utils.js";

interface Player {
  socketId: string;
  name: string;
  color: PieceColor;
  connected: boolean;
}

interface Room {
  roomId: string;
  players: Player[];
  gameId?: string;
  status: "waiting" | "playing" | "finished";
}

interface Game {
  chess: Chess;
  moveHistory: MoveRecord[];
  whitePlayerId: string; // socket ID of white player
  blackPlayerId: string;
}

class GameManager {
  private rooms = new Map<string, Room>();
  private games = new Map<string, Game>();
  private socketToRoom = new Map<string, string>(); // socketId -> roomId
  private disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>(); // socketId -> timeout

  createRoom(socketId: string, playerName: string): { roomId: string; playerColor: PieceColor } {
    const roomId = generateRoomId();
    const playerColor = randomColor();

    const room: Room = {
      roomId,
      players: [{ socketId, name: playerName, color: playerColor, connected: true }],
      status: "waiting",
    };

    this.rooms.set(roomId, room);
    this.socketToRoom.set(socketId, roomId);

    return { roomId, playerColor };
  }

  joinRoom(
    roomId: string,
    socketId: string,
    playerName: string
  ): {
    success: boolean;
    error?: string;
    gameState?: GameState;
    players?: PlayerInfo[];
    yourColor?: PieceColor;
  } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }
    if (room.status !== "waiting") {
      return { success: false, error: "Game already in progress" };
    }
    if (room.players.length >= 2) {
      return { success: false, error: "Room is full" };
    }

    const existingColor = room.players[0].color;
    const newColor: PieceColor = existingColor === "w" ? "b" : "w";

    room.players.push({ socketId, name: playerName, color: newColor, connected: true });
    this.socketToRoom.set(socketId, roomId);

    // Start the game
    const gameId = generateGameId();
    room.gameId = gameId;
    room.status = "playing";

    const chess = new Chess();
    const whitePlayer = room.players.find((p) => p.color === "w")!;
    const blackPlayer = room.players.find((p) => p.color === "b")!;

    this.games.set(gameId, {
      chess,
      moveHistory: [],
      whitePlayerId: whitePlayer.socketId,
      blackPlayerId: blackPlayer.socketId,
    });

    const gameState = this.buildGameState(gameId);
    const players = this.buildPlayerInfos(room);

    return { success: true, gameState, players, yourColor: newColor };
  }

  makeMove(
    gameId: string,
    socketId: string,
    move: MovePayload
  ): { success: boolean; error?: string; moveRecord?: MoveRecord; gameState?: GameState; gameOver?: { status: GameStatus; winner?: PieceColor; reason: string } } {
    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: "Game not found" };
    }

    // Validate turn ownership
    const currentTurn = game.chess.turn();
    const isWhite = game.whitePlayerId === socketId;
    const isBlack = game.blackPlayerId === socketId;

    if ((currentTurn === "w" && !isWhite) || (currentTurn === "b" && !isBlack)) {
      return { success: false, error: "Not your turn" };
    }

    if (!isWhite && !isBlack) {
      return { success: false, error: "You are not a player in this game" };
    }

    // Try the move
    try {
      const result = game.chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });

      if (!result) {
        return { success: false, error: "Illegal move" };
      }

      const moveRecord: MoveRecord = {
        from: result.from,
        to: result.to,
        piece: result.piece as MoveRecord["piece"],
        color: result.color as PieceColor,
        captured: result.captured ? (result.captured as MoveRecord["captured"]) : undefined,
        promotion: result.promotion ? (result.promotion as MoveRecord["promotion"]) : undefined,
        san: result.san,
        fen: game.chess.fen(),
      };

      game.moveHistory.push(moveRecord);

      const gameState = this.buildGameState(gameId);

      // Check for game over
      let gameOver: { status: GameStatus; winner?: PieceColor; reason: string } | undefined;
      if (game.chess.isCheckmate()) {
        const winner: PieceColor = currentTurn; // The player who just moved wins
        gameOver = { status: "checkmate", winner, reason: "Checkmate" };
        this.endGame(gameId, "checkmate", winner);
      } else if (game.chess.isStalemate()) {
        gameOver = { status: "stalemate", reason: "Stalemate" };
        this.endGame(gameId, "stalemate");
      } else if (game.chess.isDraw()) {
        gameOver = { status: "draw", reason: "Draw" };
        this.endGame(gameId, "draw");
      }

      return { success: true, moveRecord, gameState, gameOver };
    } catch {
      return { success: false, error: "Invalid move" };
    }
  }

  resign(gameId: string, socketId: string): { success: boolean; winner?: PieceColor; error?: string } {
    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: "Game not found" };
    }

    let winner: PieceColor;
    if (game.whitePlayerId === socketId) {
      winner = "b";
    } else if (game.blackPlayerId === socketId) {
      winner = "w";
    } else {
      return { success: false, error: "You are not a player in this game" };
    }

    this.endGame(gameId, "resigned", winner);
    return { success: true, winner };
  }

  handleDisconnect(socketId: string): {
    roomId?: string;
    playerName?: string;
    gameId?: string;
    opponentSocketId?: string;
  } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find((p) => p.socketId === socketId);
    if (!player) return null;

    player.connected = false;

    // If game hasn't started, clean up the room
    if (room.status === "waiting") {
      this.cleanupRoom(roomId);
      return null;
    }

    const opponent = room.players.find((p) => p.socketId !== socketId);

    // Start disconnect timeout
    const timer = setTimeout(() => {
      this.handleAbandon(roomId, socketId);
    }, RECONNECT_TIMEOUT_SECONDS * 1000);
    this.disconnectTimers.set(socketId, timer);

    return {
      roomId,
      playerName: player.name,
      gameId: room.gameId,
      opponentSocketId: opponent?.socketId,
    };
  }

  handleReconnect(
    oldSocketId: string,
    newSocketId: string
  ): {
    roomId: string;
    gameState: GameState;
    players: PlayerInfo[];
    yourColor: PieceColor;
    opponentSocketId?: string;
  } | null {
    const roomId = this.socketToRoom.get(oldSocketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room || !room.gameId) return null;

    const player = room.players.find((p) => p.socketId === oldSocketId);
    if (!player) return null;

    // Clear disconnect timer
    const timer = this.disconnectTimers.get(oldSocketId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(oldSocketId);
    }

    // Update socket ID
    player.socketId = newSocketId;
    player.connected = true;
    this.socketToRoom.delete(oldSocketId);
    this.socketToRoom.set(newSocketId, roomId);

    // Update game references
    const game = this.games.get(room.gameId);
    if (game) {
      if (game.whitePlayerId === oldSocketId) game.whitePlayerId = newSocketId;
      if (game.blackPlayerId === oldSocketId) game.blackPlayerId = newSocketId;
    }

    const opponent = room.players.find((p) => p.socketId !== newSocketId);

    return {
      roomId,
      gameState: this.buildGameState(room.gameId),
      players: this.buildPlayerInfos(room),
      yourColor: player.color,
      opponentSocketId: opponent?.connected ? opponent.socketId : undefined,
    };
  }

  getGameState(gameId: string): GameState | null {
    return this.buildGameState(gameId);
  }

  getRoomForSocket(socketId: string): string | undefined {
    return this.socketToRoom.get(socketId);
  }

  getRoomPlayers(roomId: string): PlayerInfo[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return this.buildPlayerInfos(room);
  }

  getPlayerColor(roomId: string, socketId: string): PieceColor | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    return room.players.find((p) => p.socketId === socketId)?.color;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  private buildGameState(gameId: string): GameState {
    const game = this.games.get(gameId)!;
    const chess = game.chess;

    let status: GameStatus = "playing";
    let winner: PieceColor | undefined;

    if (chess.isCheckmate()) {
      status = "checkmate";
      winner = chess.turn() === "w" ? "b" : "w";
    } else if (chess.isStalemate()) {
      status = "stalemate";
    } else if (chess.isDraw()) {
      status = "draw";
    }

    return {
      gameId,
      fen: chess.fen(),
      turn: chess.turn() as PieceColor,
      moveHistory: game.moveHistory,
      status,
      isCheck: chess.isCheck(),
      winner,
    };
  }

  private buildPlayerInfos(room: Room): PlayerInfo[] {
    return room.players.map((p) => ({
      id: p.socketId,
      name: p.name,
      color: p.color,
    }));
  }

  private endGame(gameId: string, status: GameStatus, winner?: PieceColor) {
    // Find and update room status
    for (const [, room] of this.rooms) {
      if (room.gameId === gameId) {
        room.status = "finished";
        break;
      }
    }
  }

  private handleAbandon(roomId: string, disconnectedSocketId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameId) return;

    const game = this.games.get(room.gameId);
    if (!game) return;

    const winner: PieceColor =
      game.whitePlayerId === disconnectedSocketId ? "b" : "w";

    this.endGame(room.gameId, "abandoned", winner);

    // Notify remaining player
    const opponent = room.players.find(
      (p) => p.socketId !== disconnectedSocketId && p.connected
    );

    return { winner, opponentSocketId: opponent?.socketId, gameId: room.gameId };
  }

  // Public version for socket handlers to use
  checkAbandon(roomId: string, disconnectedSocketId: string): {
    winner: PieceColor;
    opponentSocketId?: string;
    gameId: string;
  } | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameId) return null;

    const game = this.games.get(room.gameId);
    if (!game) return null;

    const winner: PieceColor =
      game.whitePlayerId === disconnectedSocketId ? "b" : "w";

    this.endGame(room.gameId, "abandoned", winner);

    const opponent = room.players.find(
      (p) => p.socketId !== disconnectedSocketId && p.connected
    );

    return { winner, opponentSocketId: opponent?.socketId, gameId: room.gameId };
  }

  private cleanupRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const player of room.players) {
      this.socketToRoom.delete(player.socketId);
      const timer = this.disconnectTimers.get(player.socketId);
      if (timer) {
        clearTimeout(timer);
        this.disconnectTimers.delete(player.socketId);
      }
    }

    if (room.gameId) {
      this.games.delete(room.gameId);
    }
    this.rooms.delete(roomId);
  }
}

export const gameManager = new GameManager();
