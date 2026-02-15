"use client";

interface PieceProps {
  color: string;
}

export function Bishop({ color }: PieceProps) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.27, 0.32, 0.3, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.22, 0.4, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Mitre (tall cone) */}
      <mesh position={[0, 0.85, 0]}>
        <coneGeometry args={[0.14, 0.4, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tip sphere */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
