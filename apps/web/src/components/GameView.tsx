"use client";

import { Scene } from "./Scene";
import { GameHUD } from "./GameHUD";
import { PromotionDialog } from "./PromotionDialog";
import { GameOverDialog } from "./GameOverDialog";
import { useGameStore } from "@/store/game-store";

export default function GameView() {
  const gameState = useGameStore((s) => s.gameState);
  const promotionPending = useGameStore((s) => s.promotionPending);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Scene />
      <GameHUD />
      {promotionPending && <PromotionDialog />}
      {gameState && gameState.status !== "playing" && gameState.status !== "waiting" && (
        <GameOverDialog />
      )}
    </div>
  );
}
