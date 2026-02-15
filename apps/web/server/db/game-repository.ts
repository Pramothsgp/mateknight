import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { games, players } from "./schema.js";
import type { MoveRecord, GameStatus } from "@chess/shared";

export const gameRepository = {
  async createGame(gameId: string, whitePlayerId: string, blackPlayerId: string) {
    if (!db) return;
    await db.insert(games).values({
      id: gameId,
      whitePlayerId,
      blackPlayerId,
      status: "playing",
    });
  },

  async updateGameFen(gameId: string, fen: string, moveHistory: MoveRecord[]) {
    if (!db) return;
    await db
      .update(games)
      .set({ fen, moveHistory, updatedAt: new Date() })
      .where(eq(games.id, gameId));
  },

  async endGame(gameId: string, status: GameStatus, winner?: string) {
    if (!db) return;
    await db
      .update(games)
      .set({ status, winner: winner ?? null, updatedAt: new Date() })
      .where(eq(games.id, gameId));
  },

  async getGame(gameId: string) {
    if (!db) return null;
    const result = await db.select().from(games).where(eq(games.id, gameId));
    return result[0] ?? null;
  },

  async createPlayer(id: string, username: string) {
    if (!db) return;
    await db
      .insert(players)
      .values({ id, username })
      .onConflictDoUpdate({
        target: players.id,
        set: { username, updatedAt: new Date() },
      });
  },
};
