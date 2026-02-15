"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Board } from "./Board";
import { Pieces } from "./Pieces";
import { LegalMoveIndicators } from "./LegalMoveIndicators";
import { SelectedSquareHighlight } from "./SelectedSquareHighlight";
import { useGameStore } from "@/store/game-store";

export function Scene() {
  const playerColor = useGameStore((s) => s.playerColor);

  return (
    <Canvas
      camera={{ position: [0, 8, 6], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 8, -5]} intensity={0.3} />

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={6}
        maxDistance={16}
      />

      <group rotation={[0, playerColor === "b" ? Math.PI : 0, 0]}>
        <Board />
        <Pieces />
        <LegalMoveIndicators />
        <SelectedSquareHighlight />
      </group>
    </Canvas>
  );
}
