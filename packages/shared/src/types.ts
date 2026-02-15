export type PieceColor = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

export type Square = string; // e.g. "e4", "a1"

export type GameStatus =
  | "waiting"
  | "playing"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "resigned"
  | "abandoned";

export interface MoveRecord {
  from: Square;
  to: Square;
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType;
  promotion?: PieceType;
  san: string;
  fen: string;
}

export interface GameState {
  gameId: string;
  fen: string;
  turn: PieceColor;
  moveHistory: MoveRecord[];
  status: GameStatus;
  isCheck: boolean;
  winner?: PieceColor;
}

export interface PlayerInfo {
  id: string;
  name: string;
  color: PieceColor;
}

export interface RoomState {
  roomId: string;
  players: PlayerInfo[];
  gameState?: GameState;
}

// Client -> Server payloads
export interface CreateRoomPayload {
  playerName: string;
}

export interface JoinRoomPayload {
  roomId: string;
  playerName: string;
}

export interface MovePayload {
  gameId: string;
  from: Square;
  to: Square;
  promotion?: PieceType;
}

export interface ResignPayload {
  gameId: string;
}

export interface RequestSyncPayload {
  gameId: string;
}

// Server -> Client payloads
export interface RoomCreatedPayload {
  roomId: string;
  playerColor: PieceColor;
}

export interface GameStartPayload {
  gameState: GameState;
  players: PlayerInfo[];
  yourColor: PieceColor;
}

export interface MoveConfirmedPayload {
  move: MoveRecord;
  gameState: GameState;
}

export interface MoveRejectedPayload {
  reason: string;
}

export interface GameOverPayload {
  status: GameStatus;
  winner?: PieceColor;
  reason: string;
}

export interface StateSyncPayload {
  gameState: GameState;
  players: PlayerInfo[];
  yourColor: PieceColor;
}

export interface ErrorPayload {
  message: string;
}

export interface OpponentDisconnectedPayload {
  playerName: string;
  timeoutSeconds: number;
}

export interface OpponentReconnectedPayload {
  playerName: string;
}
