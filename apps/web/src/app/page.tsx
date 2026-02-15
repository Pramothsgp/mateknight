"use client";

import dynamic from "next/dynamic";
import { useGameStore } from "@/store/game-store";
import { Lobby } from "@/components/Lobby";

const GameView = dynamic(() => import("@/components/GameView"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#a0a0a0" }}>
      Loading game...
    </div>
  ),
});

export default function Home() {
  const phase = useGameStore((s) => s.phase);

  if (phase === "lobby" || phase === "waiting") {
    return <Lobby />;
  }

  return <GameView />;
}
