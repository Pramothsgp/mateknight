"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface PieceProps {
  color: string;
}

export function Bishop({ color }: PieceProps) {
  const geometry = useMemo(() => {
    const pts = [
      // Bottom center
      [0, 0],
      // Base platform
      [0.28, 0],
      [0.30, 0.02],
      [0.30, 0.05],
      // Base rim molding
      [0.27, 0.07],
      [0.31, 0.09],
      [0.30, 0.11],
      [0.26, 0.13],
      // Taper to stem
      [0.18, 0.17],
      [0.13, 0.22],
      // Stem
      [0.10, 0.28],
      [0.09, 0.34],
      [0.09, 0.38],
      // Collar ring
      [0.10, 0.40],
      [0.14, 0.42],
      [0.15, 0.435],
      [0.14, 0.45],
      [0.10, 0.47],
      // Mitre body (bulging then tapering to point)
      [0.12, 0.50],
      [0.15, 0.55],
      [0.17, 0.60],
      [0.17, 0.65],
      [0.16, 0.70],
      [0.14, 0.74],
      [0.11, 0.78],
      [0.07, 0.82],
      [0.04, 0.85],
      // Tip transition
      [0.02, 0.87],
      // Ball on top
      [0.04, 0.89],
      [0.06, 0.91],
      [0.065, 0.935],
      [0.06, 0.96],
      [0.04, 0.98],
      [0.02, 0.99],
      // Top
      [0, 1.0],
    ].map(([x, y]) => new THREE.Vector2(x, y));

    const geo = new THREE.LatheGeometry(pts, 32);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
      </mesh>
      {/* Bishop's diagonal slit/groove in the mitre */}
      <mesh position={[0, 0.70, 0]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.005, 0.20, 0.22]} />
        <meshStandardMaterial
          color={color === "#f5f0e1" ? "#c9bea0" : "#1a1a1a"}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}
