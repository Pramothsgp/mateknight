import { nanoid } from "nanoid";

export function generateRoomId(): string {
  return nanoid(6).toUpperCase();
}

export function generateGameId(): string {
  return nanoid(12);
}

export function randomColor(): "w" | "b" {
  return Math.random() < 0.5 ? "w" : "b";
}
