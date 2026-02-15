"use client";

import { useGameStore } from "@/store/game-store";

export function GameHUD() {
  const gameState = useGameStore((s) => s.gameState);
  const playerColor = useGameStore((s) => s.playerColor);
  const players = useGameStore((s) => s.players);
  const opponentDisconnected = useGameStore((s) => s.opponentDisconnected);
  const resign = useGameStore((s) => s.resign);

  if (!gameState) return null;

  const isMyTurn = gameState.turn === playerColor;
  const myPlayer = players.find((p) => p.color === playerColor);
  const opponent = players.find((p) => p.color !== playerColor);
  const moveCount = gameState.moveHistory.length;
  const lastMove = moveCount > 0 ? gameState.moveHistory[moveCount - 1] : null;

  return (
    <div style={styles.container}>
      {/* Player info */}
      <div style={styles.topBar}>
        <div style={styles.playerInfo}>
          <span style={colorDot(playerColor === "w")} />
          <span>{myPlayer?.name ?? "You"}</span>
        </div>
        <div style={styles.vs}>vs</div>
        <div style={styles.playerInfo}>
          <span style={colorDot(playerColor !== "w")} />
          <span>{opponent?.name ?? "Opponent"}</span>
          {opponentDisconnected && <span style={styles.disconnected}> (disconnected)</span>}
        </div>
      </div>

      {/* Turn indicator */}
      <div style={styles.turnIndicator}>
        {gameState.status === "playing" && (
          <span style={{ color: isMyTurn ? "#4aff7f" : "#a0a0a0" }}>
            {isMyTurn ? "Your turn" : "Opponent's turn"}
            {gameState.isCheck && " - CHECK!"}
          </span>
        )}
      </div>

      {/* Move history (last few moves) */}
      {moveCount > 0 && (
        <div style={styles.moveHistory}>
          <span style={styles.moveLabel}>Last move: </span>
          <span style={styles.moveText}>{lastMove?.san}</span>
        </div>
      )}

      {/* Resign button */}
      {gameState.status === "playing" && (
        <button onClick={resign} style={styles.resignButton}>
          Resign
        </button>
      )}
    </div>
  );
}

function colorDot(isWhite: boolean): React.CSSProperties {
  return {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: isWhite ? "#f5f0e1" : "#2c2c2c",
    border: "1px solid #555",
    display: "inline-block",
  };
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px",
    pointerEvents: "none",
    gap: 8,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "rgba(0,0,0,0.7)",
    padding: "8px 20px",
    borderRadius: 8,
    pointerEvents: "auto",
  },
  playerInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#e0e0e0",
  },
  vs: {
    color: "#555",
    fontSize: 12,
  },
  disconnected: {
    color: "#ff4a4a",
    fontSize: 12,
  },
  turnIndicator: {
    fontSize: 16,
    fontWeight: 600,
  },
  moveHistory: {
    background: "rgba(0,0,0,0.5)",
    padding: "4px 12px",
    borderRadius: 4,
    fontSize: 13,
  },
  moveLabel: {
    color: "#666",
  },
  moveText: {
    color: "#4a9eff",
    fontFamily: "monospace",
    fontWeight: 600,
  },
  resignButton: {
    position: "fixed",
    bottom: 20,
    right: 20,
    padding: "8px 20px",
    background: "rgba(255,74,74,0.2)",
    color: "#ff4a4a",
    border: "1px solid #ff4a4a",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
    pointerEvents: "auto",
  },
};
