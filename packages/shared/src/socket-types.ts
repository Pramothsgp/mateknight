import type {
  CreateRoomPayload,
  JoinRoomPayload,
  MovePayload,
  ResignPayload,
  RequestSyncPayload,
  RoomCreatedPayload,
  GameStartPayload,
  MoveConfirmedPayload,
  MoveRejectedPayload,
  GameOverPayload,
  StateSyncPayload,
  ErrorPayload,
  OpponentDisconnectedPayload,
  OpponentReconnectedPayload,
} from "./types.js";
import { ClientEvents, ServerEvents } from "./events.js";

export interface ClientToServerEvents {
  [ClientEvents.CREATE_ROOM]: (payload: CreateRoomPayload) => void;
  [ClientEvents.JOIN_ROOM]: (payload: JoinRoomPayload) => void;
  [ClientEvents.MAKE_MOVE]: (payload: MovePayload) => void;
  [ClientEvents.RESIGN]: (payload: ResignPayload) => void;
  [ClientEvents.REQUEST_SYNC]: (payload: RequestSyncPayload) => void;
}

export interface ServerToClientEvents {
  [ServerEvents.ROOM_CREATED]: (payload: RoomCreatedPayload) => void;
  [ServerEvents.GAME_START]: (payload: GameStartPayload) => void;
  [ServerEvents.MOVE_CONFIRMED]: (payload: MoveConfirmedPayload) => void;
  [ServerEvents.MOVE_REJECTED]: (payload: MoveRejectedPayload) => void;
  [ServerEvents.GAME_OVER]: (payload: GameOverPayload) => void;
  [ServerEvents.STATE_SYNC]: (payload: StateSyncPayload) => void;
  [ServerEvents.ERROR]: (payload: ErrorPayload) => void;
  [ServerEvents.OPPONENT_DISCONNECTED]: (payload: OpponentDisconnectedPayload) => void;
  [ServerEvents.OPPONENT_RECONNECTED]: (payload: OpponentReconnectedPayload) => void;
}
