"use client";

interface PieceProps {
  color: string;
}

export function Knight({ color }: PieceProps) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.3, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.5, 0]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.4, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head (angled box for horse-like shape) */}
      <mesh position={[0, 0.75, -0.08]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.2, 0.35, 0.22]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Ear/mane accent */}
      <mesh position={[0, 0.92, 0.02]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
