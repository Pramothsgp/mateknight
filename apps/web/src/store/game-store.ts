"use client";

import { create } from "zustand";
import type {
  PieceColor,
  PieceType,
  GameState,
  PlayerInfo,
  MoveRecord,
  Square,
} from "@chess/shared";
import { getSocket } from "@/services/socket-service";
import { ClientEvents } from "@chess/shared";
import { Chess } from "chess.js";

export type Phase = "lobby" | "waiting" | "playing";

interface GameStore {
  // Connection
  connected: boolean;
  setConnected: (connected: boolean) => void;

  // Room
  phase: Phase;
  roomId: string | null;
  playerColor: PieceColor;
  players: PlayerInfo[];
  opponentDisconnected: boolean;
  disconnectTimeout: number;

  // Game
  gameState: GameState | null;

  // UI
  selectedSquare: Square | null;
  legalMoves: Square[];
  pendingMove: boolean;
  promotionPending: { from: Square; to: Square } | null;

  // Actions
  createRoom: (playerName: string) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  handleSquareClick: (square: Square) => void;
  selectPromotion: (piece: PieceType) => void;
  cancelPromotion: () => void;
  resign: () => void;

  // Server event handlers
  onRoomCreated: (roomId: string, playerColor: PieceColor) => void;
  onGameStart: (gameState: GameState, players: PlayerInfo[], yourColor: PieceColor) => void;
  onMoveConfirmed: (move: MoveRecord, gameState: GameState) => void;
  onMoveRejected: (reason: string) => void;
  onGameOver: (status: string, winner?: PieceColor, reason?: string) => void;
  onStateSync: (gameState: GameState, players: PlayerInfo[], yourColor: PieceColor) => void;
  onError: (message: string) => void;
  onOpponentDisconnected: (playerName: string, timeoutSeconds: number) => void;
  onOpponentReconnected: (playerName: string) => void;
}

function getLegalMovesForSquare(fen: string, square: Square): Square[] {
  try {
    const chess = new Chess(fen);
    const moves = chess.moves({ square: square as any, verbose: true });
    return moves.map((m) => m.to);
  } catch {
    return [];
  }
}

function isPromotionMove(fen: string, from: Square, to: Square): boolean {
  try {
    const chess = new Chess(fen);
    const moves = chess.moves({ square: from as any, verbose: true });
    return moves.some((m) => m.to === to && m.promotion);
  } catch {
    return false;
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Connection
  connected: false,
  setConnected: (connected) => set({ connected }),

  // Room
  phase: "lobby",
  roomId: null,
  playerColor: "w",
  players: [],
  opponentDisconnected: false,
  disconnectTimeout: 0,

  // Game
  gameState: null,

  // UI
  selectedSquare: null,
  legalMoves: [],
  pendingMove: false,
  promotionPending: null,

  // Actions
  createRoom: (playerName) => {
    const socket = getSocket();
    socket.emit(ClientEvents.CREATE_ROOM, { playerName });
  },

  joinRoom: (roomId, playerName) => {
    const socket = getSocket();
    socket.emit(ClientEvents.JOIN_ROOM, { roomId, playerName });
  },

  handleSquareClick: (square) => {
    const state = get();
    if (!state.gameState || state.gameState.status !== "playing") return;
    if (state.pendingMove) return;

    // Not our turn
    if (state.gameState.turn !== state.playerColor) return;

    const fen = state.gameState.fen;

    // If we have a selected square and click a legal move target -> make move
    if (state.selectedSquare && state.legalMoves.includes(square)) {
      // Check promotion
      if (isPromotionMove(fen, state.selectedSquare, square)) {
        set({ promotionPending: { from: state.selectedSquare, to: square } });
        return;
      }

      // Normal move
      const socket = getSocket();
      socket.emit(ClientEvents.MAKE_MOVE, {
        gameId: state.gameState.gameId,
        from: state.selectedSquare,
        to: square,
      });
      set({ selectedSquare: null, legalMoves: [], pendingMove: true });
      return;
    }

    // Select a new square (must be our own piece)
    const chess = new Chess(fen);
    const piece = chess.get(square as any);
    if (piece && piece.color === state.playerColor) {
      const moves = getLegalMovesForSquare(fen, square);
      set({ selectedSquare: square, legalMoves: moves });
    } else {
      set({ selectedSquare: null, legalMoves: [] });
    }
  },

  selectPromotion: (piece) => {
    const state = get();
    if (!state.promotionPending || !state.gameState) return;

    const socket = getSocket();
    socket.emit(ClientEvents.MAKE_MOVE, {
      gameId: state.gameState.gameId,
      from: state.promotionPending.from,
      to: state.promotionPending.to,
      promotion: piece,
    });
    set({ promotionPending: null, selectedSquare: null, legalMoves: [], pendingMove: true });
  },

  cancelPromotion: () => {
    set({ promotionPending: null });
  },

  resign: () => {
    const state = get();
    if (!state.gameState) return;
    const socket = getSocket();
    socket.emit(ClientEvents.RESIGN, { gameId: state.gameState.gameId });
  },

  // Server event handlers
  onRoomCreated: (roomId, playerColor) => {
    set({ roomId, playerColor, phase: "waiting" });
  },

  onGameStart: (gameState, players, yourColor) => {
    set({
      gameState,
      players,
      playerColor: yourColor,
      phase: "playing",
      selectedSquare: null,
      legalMoves: [],
      pendingMove: false,
    });
  },

  onMoveConfirmed: (_move, gameState) => {
    set({
      gameState,
      pendingMove: false,
      selectedSquare: null,
      legalMoves: [],
    });
  },

  onMoveRejected: (reason) => {
    console.warn("Move rejected:", reason);
    set({ pendingMove: false });
  },

  onGameOver: (_status, _winner, _reason) => {
    // gameState will be updated via moveConfirmed, just clear pending
    set({ pendingMove: false, selectedSquare: null, legalMoves: [] });
  },

  onStateSync: (gameState, players, yourColor) => {
    set({
      gameState,
      players,
      playerColor: yourColor,
      phase: "playing",
      pendingMove: false,
    });
  },

  onError: (message) => {
    console.error("Server error:", message);
  },

  onOpponentDisconnected: (_playerName, timeoutSeconds) => {
    set({ opponentDisconnected: true, disconnectTimeout: timeoutSeconds });
  },

  onOpponentReconnected: (_playerName) => {
    set({ opponentDisconnected: false, disconnectTimeout: 0 });
  },
}));
