"use client";

import { squareTo3DPosition } from "@chess/shared";
import { useGameStore } from "@/store/game-store";

export function LegalMoveIndicators() {
  const legalMoves = useGameStore((s) => s.legalMoves);

  if (legalMoves.length === 0) return null;

  return (
    <group>
      {legalMoves.map((square) => {
        const [x, , z] = squareTo3DPosition(square);
        return (
          <mesh key={square} position={[x, 0.06, z]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
            <meshStandardMaterial
              color="#4aff7f"
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
}
