"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/game-store";
import { getSocket } from "@/services/socket-service";

export function Lobby() {
  const [playerName, setPlayerName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [error, setError] = useState("");

  const phase = useGameStore((s) => s.phase);
  const roomId = useGameStore((s) => s.roomId);
  const connected = useGameStore((s) => s.connected);
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);

  // Initialize socket connection
  useEffect(() => {
    getSocket();
  }, []);

  const handleCreate = () => {
    if (!playerName.trim()) {
      setError("Enter your name first");
      return;
    }
    setError("");
    createRoom(playerName.trim());
  };

  const handleJoin = () => {
    if (!playerName.trim()) {
      setError("Enter your name first");
      return;
    }
    if (!joinRoomId.trim()) {
      setError("Enter a room code");
      return;
    }
    setError("");
    joinRoom(joinRoomId.trim().toUpperCase(), playerName.trim());
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>3D Chess</h1>
        <p style={styles.subtitle}>
          {connected ? "Connected" : "Connecting..."}
        </p>

        {phase === "waiting" && roomId ? (
          <div style={styles.waitingSection}>
            <p style={styles.waitingText}>Waiting for opponent...</p>
            <div style={styles.roomCode}>
              <span style={styles.roomLabel}>Room Code</span>
              <span style={styles.roomId}>{roomId}</span>
            </div>
            <p style={styles.hint}>Share this code with your opponent</p>
          </div>
        ) : (
          <div style={styles.buttonGroup}>
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={styles.input}
              maxLength={20}
            />

            <button
              onClick={handleCreate}
              style={{
                ...styles.button,
                opacity: !connected ? 0.5 : 1,
              }}
              disabled={!connected}
            >
              Create Game
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or join</span>
              <span style={styles.dividerLine} />
            </div>

            <input
              type="text"
              placeholder="Room code"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              style={styles.input}
              maxLength={6}
            />
            <button
              onClick={handleJoin}
              style={{
                ...styles.buttonSecondary,
                opacity: !connected ? 0.5 : 1,
              }}
              disabled={!connected}
            >
              Join Game
            </button>

            {error && <p style={styles.error}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
  },
  card: {
    background: "#1a1a1a",
    borderRadius: 16,
    padding: "48px 40px",
    minWidth: 360,
    textAlign: "center",
    border: "1px solid #333",
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 8,
    color: "#e0e0e0",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 32,
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#0a0a0a",
    color: "#e0e0e0",
    fontSize: 16,
    outline: "none",
    textAlign: "center",
  },
  button: {
    padding: "12px 24px",
    borderRadius: 8,
    background: "#4a9eff",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    border: "none",
    transition: "background 0.2s",
  },
  buttonSecondary: {
    padding: "12px 24px",
    borderRadius: 8,
    background: "#2a2a2a",
    color: "#e0e0e0",
    fontSize: 16,
    fontWeight: 600,
    border: "1px solid #444",
    transition: "background 0.2s",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "4px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#333",
  },
  dividerText: {
    color: "#555",
    fontSize: 13,
  },
  error: {
    color: "#ff4a4a",
    fontSize: 13,
    marginTop: 4,
  },
  waitingSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  waitingText: {
    color: "#a0a0a0",
    fontSize: 16,
  },
  roomCode: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  roomLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  roomId: {
    fontSize: 32,
    fontWeight: 700,
    color: "#4a9eff",
    letterSpacing: 4,
    fontFamily: "monospace",
  },
  hint: {
    fontSize: 13,
    color: "#555",
  },
};
