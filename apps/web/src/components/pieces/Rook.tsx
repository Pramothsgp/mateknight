"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface PieceProps {
  color: string;
}

export function Rook({ color }: PieceProps) {
  const bodyGeometry = useMemo(() => {
    const pts = [
      // Bottom center
      [0, 0],
      // Base platform
      [0.30, 0],
      [0.32, 0.02],
      [0.32, 0.05],
      // Base rim molding
      [0.28, 0.07],
      [0.33, 0.09],
      [0.32, 0.11],
      [0.27, 0.13],
      // Taper to tower
      [0.20, 0.17],
      [0.17, 0.22],
      // Tower body
      [0.16, 0.28],
      [0.15, 0.36],
      [0.15, 0.44],
      [0.15, 0.50],
      // Collar ring
      [0.16, 0.52],
      [0.18, 0.54],
      [0.18, 0.555],
      [0.17, 0.57],
      // Upper tower widening to rim
      [0.18, 0.60],
      [0.22, 0.63],
      [0.24, 0.65],
      // Rim/platform top
      [0.25, 0.67],
      [0.25, 0.72],
      // Inner wall going to center (creates flat top)
      [0.20, 0.72],
      [0.20, 0.68],
      [0, 0.68],
    ].map(([x, y]) => new THREE.Vector2(x, y));

    const geo = new THREE.LatheGeometry(pts, 32);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const mat = <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />;

  return (
    <group>
      <mesh geometry={bodyGeometry}>{mat}</mesh>
      {/* Crenellations - 5 merlons evenly spaced */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * Math.PI * 2) / 5;
        const r = 0.20;
        const cx = Math.cos(angle) * r;
        const cz = Math.sin(angle) * r;
        return (
          <mesh key={i} position={[cx, 0.80, cz]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.12, 0.16, 0.07]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
          </mesh>
        );
      })}
    </group>
  );
}
