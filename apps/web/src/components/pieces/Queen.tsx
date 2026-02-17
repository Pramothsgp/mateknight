"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface PieceProps {
  color: string;
}

export function Queen({ color }: PieceProps) {
  const bodyGeometry = useMemo(() => {
    const pts = [
      // Bottom center
      [0, 0],
      // Base platform
      [0.30, 0],
      [0.32, 0.02],
      [0.32, 0.06],
      // Base rim molding
      [0.28, 0.08],
      [0.34, 0.10],
      [0.32, 0.12],
      [0.27, 0.14],
      // Taper to stem
      [0.18, 0.18],
      [0.13, 0.24],
      // Stem
      [0.11, 0.30],
      [0.10, 0.36],
      [0.10, 0.42],
      // Collar ring
      [0.11, 0.44],
      [0.15, 0.46],
      [0.16, 0.475],
      [0.15, 0.49],
      [0.11, 0.51],
      // Body widening elegantly
      [0.13, 0.55],
      [0.16, 0.60],
      [0.18, 0.66],
      [0.19, 0.72],
      // Crown base
      [0.20, 0.76],
      [0.21, 0.80],
      [0.20, 0.83],
      // Crown rim (coronet)
      [0.18, 0.85],
      [0.14, 0.87],
      [0, 0.87],
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
      {/* Crown points - 8 small tipped prongs */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i * Math.PI * 2) / 8;
        const r = 0.16;
        const cx = Math.cos(angle) * r;
        const cz = Math.sin(angle) * r;
        return (
          <group key={i}>
            {/* Crown prong */}
            <mesh position={[cx, 0.93, cz]}>
              <coneGeometry args={[0.03, 0.12, 6]} />
              <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
            </mesh>
            {/* Small ball on prong tip */}
            <mesh position={[cx, 1.00, cz]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
            </mesh>
          </group>
        );
      })}
      {/* Central orb on top */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
      </mesh>
    </group>
  );
}
