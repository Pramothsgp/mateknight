"use client";

interface PieceProps {
  color: string;
}

export function Rook({ color }: PieceProps) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.3, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tower body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.4, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Top platform */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.1, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Crenellations */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2;
        const cx = Math.cos(angle) * 0.17;
        const cz = Math.sin(angle) * 0.17;
        return (
          <mesh key={i} position={[cx, 0.88, cz]}>
            <boxGeometry args={[0.1, 0.15, 0.1]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}
