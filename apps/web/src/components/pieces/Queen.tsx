"use client";

interface PieceProps {
  color: string;
}

export function Queen({ color }: PieceProps) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.28, 0.34, 0.3, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.24, 0.4, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Crown cone */}
      <mesh position={[0, 0.85, 0]}>
        <coneGeometry args={[0.18, 0.35, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Crown sphere */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Crown points */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * Math.PI * 2) / 5;
        const cx = Math.cos(angle) * 0.13;
        const cz = Math.sin(angle) * 0.13;
        return (
          <mesh key={i} position={[cx, 1.0, cz]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}
