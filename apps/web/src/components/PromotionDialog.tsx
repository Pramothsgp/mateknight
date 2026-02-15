"use client";

import { useGameStore } from "@/store/game-store";
import type { PieceType } from "@chess/shared";

const PROMOTION_PIECES: { type: PieceType; label: string }[] = [
  { type: "q", label: "Queen" },
  { type: "r", label: "Rook" },
  { type: "b", label: "Bishop" },
  { type: "n", label: "Knight" },
];

export function PromotionDialog() {
  const selectPromotion = useGameStore((s) => s.selectPromotion);
  const cancelPromotion = useGameStore((s) => s.cancelPromotion);
  const playerColor = useGameStore((s) => s.playerColor);

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h3 style={styles.title}>Promote pawn to:</h3>
        <div style={styles.options}>
          {PROMOTION_PIECES.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => selectPromotion(type)}
              style={styles.option}
            >
              <span style={styles.pieceIcon}>
                {getPieceSymbol(type, playerColor)}
              </span>
              <span style={styles.pieceLabel}>{label}</span>
            </button>
          ))}
        </div>
        <button onClick={cancelPromotion} style={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function getPieceSymbol(type: PieceType, color: string): string {
  const symbols: Record<string, Record<string, string>> = {
    w: { q: "\u2655", r: "\u2656", b: "\u2657", n: "\u2658" },
    b: { q: "\u265B", r: "\u265C", b: "\u265D", n: "\u265E" },
  };
  return symbols[color]?.[type] ?? "?";
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  dialog: {
    background: "#1a1a1a",
    borderRadius: 12,
    padding: "24px 32px",
    border: "1px solid #333",
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    color: "#e0e0e0",
    marginBottom: 20,
  },
  options: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
  },
  option: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "12px 16px",
    background: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background 0.2s",
    color: "#e0e0e0",
  },
  pieceIcon: {
    fontSize: 36,
  },
  pieceLabel: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  cancelButton: {
    padding: "8px 24px",
    background: "transparent",
    color: "#666",
    border: "1px solid #333",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
  },
};
