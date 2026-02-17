"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface PieceProps {
  color: string;
}

export function King({ color }: PieceProps) {
  const bodyGeometry = useMemo(() => {
    const pts = [
      // Bottom center
      [0, 0],
      // Base platform (widest)
      [0.32, 0],
      [0.34, 0.02],
      [0.34, 0.06],
      // Base rim molding
      [0.30, 0.08],
      [0.36, 0.10],
      [0.34, 0.12],
      [0.28, 0.14],
      // Taper to stem
      [0.20, 0.18],
      [0.14, 0.24],
      // Stem
      [0.12, 0.30],
      [0.11, 0.36],
      [0.11, 0.42],
      // Collar ring
      [0.12, 0.44],
      [0.16, 0.46],
      [0.17, 0.475],
      [0.16, 0.49],
      [0.12, 0.51],
      // Body widening
      [0.14, 0.56],
      [0.17, 0.62],
      [0.19, 0.68],
      [0.20, 0.74],
      // Crown band
      [0.22, 0.78],
      [0.23, 0.81],
      [0.22, 0.84],
      // Crown top tapering
      [0.20, 0.86],
      [0.16, 0.89],
      [0.12, 0.91],
      // Pad for cross
      [0.08, 0.93],
      [0.04, 0.94],
      [0, 0.95],
    ].map(([x, y]) => new THREE.Vector2(x, y));

    const geo = new THREE.LatheGeometry(pts, 32);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      <mesh geometry={bodyGeometry}>
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
      </mesh>
      {/* Cross - vertical bar */}
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[0.045, 0.26, 0.045]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
      </mesh>
      {/* Cross - horizontal bar */}
      <mesh position={[0, 1.13, 0]}>
        <boxGeometry args={[0.18, 0.045, 0.045]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
      </mesh>
    </group>
  );
}
