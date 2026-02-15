"use client";

import { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { BOARD_SIZE, SQUARE_SIZE, squareTo3DPosition, FILES, RANKS } from "@chess/shared";
import { useGameStore } from "@/store/game-store";

const LIGHT_COLOR = "#f0d9b5";
const DARK_COLOR = "#b58863";
const LABEL_OFFSET = 0.45;

const labelStyle: React.CSSProperties = {
  color: "#888",
  fontSize: 12,
  fontFamily: "monospace",
  fontWeight: 600,
  userSelect: "none",
  pointerEvents: "none",
};

export function Board() {
  const handleSquareClick = useGameStore((s) => s.handleSquareClick);

  const squares = [];
  for (let file = 0; file < BOARD_SIZE; file++) {
    for (let rank = 0; rank < BOARD_SIZE; rank++) {
      const square = FILES[file] + RANKS[rank];
      const [x, , z] = squareTo3DPosition(square);
      const isLight = (file + rank) % 2 === 0;

      squares.push(
        <mesh
          key={square}
          position={[x, -0.05, z]}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            handleSquareClick(square);
          }}
          receiveShadow
        >
          <boxGeometry args={[SQUARE_SIZE, 0.1, SQUARE_SIZE]} />
          <meshStandardMaterial color={isLight ? LIGHT_COLOR : DARK_COLOR} />
        </mesh>
      );
    }
  }

  // File labels (a-h) along the near edge
  const fileLabels = FILES.map((file, i) => {
    const x = (i - 3.5) * SQUARE_SIZE;
    return (
      <Html
        key={`file-${file}`}
        position={[x, 0.01, 3.5 * SQUARE_SIZE + LABEL_OFFSET]}
        center
        distanceFactor={8}
      >
        <span style={labelStyle}>{file}</span>
      </Html>
    );
  });

  // Rank labels (1-8) along the left edge
  const rankLabels = RANKS.map((rank, i) => {
    const z = (3.5 - i) * SQUARE_SIZE;
    return (
      <Html
        key={`rank-${rank}`}
        position={[-3.5 * SQUARE_SIZE - LABEL_OFFSET, 0.01, z]}
        center
        distanceFactor={8}
      >
        <span style={labelStyle}>{rank}</span>
      </Html>
    );
  });

  return (
    <group>
      {squares}
      {fileLabels}
      {rankLabels}
    </group>
  );
}
