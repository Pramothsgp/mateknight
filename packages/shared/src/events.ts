export const ClientEvents = {
  CREATE_ROOM: "client:create_room",
  JOIN_ROOM: "client:join_room",
  MAKE_MOVE: "client:make_move",
  RESIGN: "client:resign",
  REQUEST_SYNC: "client:request_sync",
} as const;

export const ServerEvents = {
  ROOM_CREATED: "server:room_created",
  GAME_START: "server:game_start",
  MOVE_CONFIRMED: "server:move_confirmed",
  MOVE_REJECTED: "server:move_rejected",
  GAME_OVER: "server:game_over",
  STATE_SYNC: "server:state_sync",
  ERROR: "server:error",
  OPPONENT_DISCONNECTED: "server:opponent_disconnected",
  OPPONENT_RECONNECTED: "server:opponent_reconnected",
} as const;

export type ClientEventName = (typeof ClientEvents)[keyof typeof ClientEvents];
export type ServerEventName = (typeof ServerEvents)[keyof typeof ServerEvents];
