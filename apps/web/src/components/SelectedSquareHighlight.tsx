"use client";

import { squareTo3DPosition, SQUARE_SIZE } from "@chess/shared";
import { useGameStore } from "@/store/game-store";

export function SelectedSquareHighlight() {
  const selectedSquare = useGameStore((s) => s.selectedSquare);

  if (!selectedSquare) return null;

  const [x, , z] = squareTo3DPosition(selectedSquare);

  return (
    <mesh position={[x, 0.06, z]}>
      <boxGeometry args={[SQUARE_SIZE * 0.95, 0.02, SQUARE_SIZE * 0.95]} />
      <meshStandardMaterial color="#4a9eff" transparent opacity={0.5} />
    </mesh>
  );
}
