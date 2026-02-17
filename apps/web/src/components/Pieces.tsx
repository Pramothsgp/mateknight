"use client";

import { Chess } from "chess.js";
import { squareTo3DPosition, FILES, RANKS } from "@chess/shared";
import { useGameStore } from "@/store/game-store";
import { AnimatedPiece } from "./AnimatedPiece";
import { Pawn } from "./pieces/Pawn";
import { Rook } from "./pieces/Rook";
import { Knight } from "./pieces/Knight";
import { Bishop } from "./pieces/Bishop";
import { Queen } from "./pieces/Queen";
import { King } from "./pieces/King";

const PIECE_COMPONENTS: Record<string, React.ComponentType<{ color: string }>> = {
  p: Pawn,
  r: Rook,
  n: Knight,
  b: Bishop,
  q: Queen,
  k: King,
};

const WHITE_COLOR = "#f5f0e1";
const BLACK_COLOR = "#2c2c2c";
const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function Pieces() {
  const gameFen = useGameStore((s) => s.gameState?.fen);
  const handleSquareClick = useGameStore((s) => s.handleSquareClick);

  const fen = gameFen || DEFAULT_FEN;
  const chess = new Chess(fen);
  const board = chess.board();

  const pieces: React.ReactElement[] = [];

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;

      const square = FILES[file] + RANKS[7 - rank];
      const [x, , z] = squareTo3DPosition(square);
      const PieceComponent = PIECE_COMPONENTS[piece.type];
      const materialColor = piece.color === "w" ? WHITE_COLOR : BLACK_COLOR;

      if (!PieceComponent) continue;

      // White pieces need 180° Y rotation so they face the black side
      const rotation: [number, number, number] = piece.color === "w" ? [0, Math.PI, 0] : [0, 0, 0];

      pieces.push(
        <AnimatedPiece key={`${piece.color}${piece.type}-${square}`} targetPosition={[x, 0, z]}>
          <group
            rotation={rotation}
            onClick={(e) => {
              e.stopPropagation();
              handleSquareClick(square);
            }}
          >
            <PieceComponent color={materialColor} />
          </group>
        </AnimatedPiece>
      );
    }
  }

  return <group>{pieces}</group>;
}
