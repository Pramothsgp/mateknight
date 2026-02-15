"use client";

import { useMemo } from "react";
import { Chess } from "chess.js";
import type { Square } from "@chess/shared";

export function useChessLocal(fen: string | undefined) {
  const chess = useMemo(() => {
    if (!fen) return null;
    try {
      return new Chess(fen);
    } catch {
      return null;
    }
  }, [fen]);

  const getLegalMoves = (square: Square): Square[] => {
    if (!chess) return [];
    try {
      return chess.moves({ square: square as any, verbose: true }).map((m) => m.to);
    } catch {
      return [];
    }
  };

  const isCheck = chess?.isCheck() ?? false;
  const isCheckmate = chess?.isCheckmate() ?? false;
  const isStalemate = chess?.isStalemate() ?? false;
  const isDraw = chess?.isDraw() ?? false;
  const turn = chess?.turn() as "w" | "b" | undefined;

  return { chess, getLegalMoves, isCheck, isCheckmate, isStalemate, isDraw, turn };
}
