"use client";

import { squareTo3DPosition } from "@chess/shared";
import { useGameStore } from "@/store/game-store";

const MOVE_COLOR = "#4aff7f";
const CAPTURE_COLOR = "#ff4444";
const PATH_COLOR = "#ff6666";

export function LegalMoveIndicators() {
  const legalMoveInfos = useGameStore((s) => s.legalMoveInfos);

  if (legalMoveInfos.length === 0) return null;

  const elements: React.ReactElement[] = [];

  for (const move of legalMoveInfos) {
    const [x, , z] = squareTo3DPosition(move.to);

    if (move.isCapture) {
      // Capture target: red ring highlight
      elements.push(
        <mesh key={`capture-${move.to}`} position={[x, 0.06, z]}>
          <torusGeometry args={[0.35, 0.04, 8, 24]} />
          <meshStandardMaterial color={CAPTURE_COLOR} transparent opacity={0.8} />
        </mesh>
      );

      // Attack path: red dots along intermediate squares
      for (const pathSquare of move.path) {
        const [px, , pz] = squareTo3DPosition(pathSquare);
        elements.push(
          <mesh key={`path-${move.to}-${pathSquare}`} position={[px, 0.06, pz]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
            <meshStandardMaterial color={PATH_COLOR} transparent opacity={0.5} />
          </mesh>
        );
      }
    } else {
      // Normal move: green dot
      elements.push(
        <mesh key={`move-${move.to}`} position={[x, 0.06, z]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
          <meshStandardMaterial color={MOVE_COLOR} transparent opacity={0.6} />
        </mesh>
      );
    }
  }

  return <group>{elements}</group>;
}
