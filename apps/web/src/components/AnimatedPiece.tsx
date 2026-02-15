"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";

interface AnimatedPieceProps {
  targetPosition: [number, number, number];
  children: React.ReactNode;
}

const LERP_SPEED = 8;

export function AnimatedPiece({ targetPosition, children }: AnimatedPieceProps) {
  const groupRef = useRef<Group>(null);
  const target = useRef(new Vector3(...targetPosition));

  target.current.set(...targetPosition);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const pos = groupRef.current.position;
    const t = target.current;

    // Lerp toward target
    const lerpFactor = 1 - Math.pow(1 - Math.min(LERP_SPEED * delta, 1), 1);
    pos.x += (t.x - pos.x) * lerpFactor;
    pos.y += (t.y - pos.y) * lerpFactor;
    pos.z += (t.z - pos.z) * lerpFactor;

    // Snap if very close
    if (pos.distanceTo(t) < 0.001) {
      pos.copy(t);
    }
  });

  return (
    <group ref={groupRef} position={targetPosition}>
      {children}
    </group>
  );
}
