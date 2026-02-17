"use client";

import { useChessPiece } from "./useChessModel";

interface PieceProps {
  color: string;
}

export function Pawn({ color }: PieceProps) {
  const { geometries, scale } = useChessPiece("pawn");

  return (
    <group scale={scale}>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}
