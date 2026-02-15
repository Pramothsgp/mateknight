import { pgTable, text, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: text("id").primaryKey(),
  whitePlayerId: text("white_player_id"),
  blackPlayerId: text("black_player_id"),
  fen: text("fen").notNull().default("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
  moveHistory: jsonb("move_history").notNull().default([]),
  status: varchar("status", { length: 20 }).notNull().default("waiting"),
  winner: varchar("winner", { length: 1 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
