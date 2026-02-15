"use client";

import { useGameStore } from "@/store/game-store";

export function GameOverDialog() {
  const gameState = useGameStore((s) => s.gameState);
  const playerColor = useGameStore((s) => s.playerColor);

  if (!gameState) return null;

  const isWinner = gameState.winner === playerColor;
  const isDraw = !gameState.winner;

  let title: string;
  let subtitle: string;

  switch (gameState.status) {
    case "checkmate":
      title = isWinner ? "You Win!" : "You Lose";
      subtitle = "Checkmate";
      break;
    case "stalemate":
      title = "Draw";
      subtitle = "Stalemate";
      break;
    case "draw":
      title = "Draw";
      subtitle = "Game drawn";
      break;
    case "resigned":
      title = isWinner ? "You Win!" : "You Lose";
      subtitle = isWinner ? "Opponent resigned" : "You resigned";
      break;
    case "abandoned":
      title = isWinner ? "You Win!" : "Game Over";
      subtitle = "Opponent abandoned the game";
      break;
    default:
      return null;
  }

  const handleNewGame = () => {
    // Reset to lobby
    window.location.reload();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h2 style={{
          ...styles.title,
          color: isDraw ? "#a0a0a0" : isWinner ? "#4aff7f" : "#ff4a4a",
        }}>
          {title}
        </h2>
        <p style={styles.subtitle}>{subtitle}</p>
        <p style={styles.moves}>
          Total moves: {gameState.moveHistory.length}
        </p>
        <button onClick={handleNewGame} style={styles.button}>
          New Game
        </button>
      </div>
    </div>
  );
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
    padding: "32px 40px",
    border: "1px solid #333",
    textAlign: "center",
    minWidth: 280,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#a0a0a0",
    marginBottom: 16,
  },
  moves: {
    fontSize: 13,
    color: "#555",
    marginBottom: 24,
  },
  button: {
    padding: "12px 32px",
    background: "#4a9eff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
};
