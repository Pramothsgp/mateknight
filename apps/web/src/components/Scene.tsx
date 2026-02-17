"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
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
      shadows
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, toneMapping: 3 /* ACESFilmicToneMapping */ }}
    >
      {/* Dark background */}
      <color attach="background" args={["#0a0a0f"]} />
      <fog attach="fog" args={["#0a0a0f", 18, 35]} />

      {/* Stars in the background */}
      <Stars radius={50} depth={60} count={1500} factor={4} saturation={0.2} fade speed={1.5} />

      {/* Three-point lighting */}
      {/* Key light - warm, from upper right */}
      <directionalLight
        position={[6, 12, 4]}
        intensity={1.2}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.001}
      />
      {/* Fill light - cool, from left */}
      <directionalLight
        position={[-5, 6, -3]}
        intensity={0.4}
        color="#b0c4ff"
      />
      {/* Rim / back light - gives edge definition */}
      <spotLight
        position={[0, 10, -8]}
        angle={0.5}
        penumbra={0.8}
        intensity={0.6}
        color="#ffd6a0"
      />
      {/* Subtle ambient to fill deep shadows */}
      <ambientLight intensity={0.15} color="#8090b0" />
      {/* Under-board accent glow */}
      <pointLight position={[0, -1, 0]} intensity={0.3} color="#4060a0" distance={12} />

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={6}
        maxDistance={16}
      />

      <group rotation={[0, playerColor === "b" ? Math.PI : 0, 0]}>
        <Board />
        <Suspense fallback={null}>
          <Pieces />
        </Suspense>
        <LegalMoveIndicators />
        <SelectedSquareHighlight />

        {/* Soft contact shadows under pieces */}
        <ContactShadows
          position={[0, -0.04, 0]}
          opacity={0.6}
          scale={12}
          blur={2.5}
          far={4}
          color="#000000"
        />
      </group>

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.8}
          luminanceSmoothing={0.5}
          intensity={0.3}
        />
        <Vignette eskil={false} offset={0.3} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
