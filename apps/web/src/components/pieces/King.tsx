"use client";

interface PieceProps {
  color: string;
}

export function King({ color }: PieceProps) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.3, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.14, 0.26, 0.4, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Upper body */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.2, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cross vertical */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.06, 0.3, 0.06]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cross horizontal */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.2, 0.06, 0.06]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
