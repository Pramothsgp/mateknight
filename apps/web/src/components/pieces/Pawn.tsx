"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface PieceProps {
  color: string;
}

export function Pawn({ color }: PieceProps) {
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
      // Head (sphere-like)
      [0.12, 0.50],
      [0.16, 0.54],
      [0.18, 0.58],
      [0.18, 0.62],
      [0.16, 0.66],
      [0.12, 0.70],
      [0.07, 0.73],
      [0.03, 0.75],
      // Top
      [0, 0.76],
    ].map(([x, y]) => new THREE.Vector2(x, y));

    const geo = new THREE.LatheGeometry(pts, 32);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
    </mesh>
  );
}
