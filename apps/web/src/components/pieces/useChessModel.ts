"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/chess_set/chess_set_1k.gltf";

// Scale factor: model pieces are ~0.05-0.095m tall, we need pieces visible on 1-unit squares
const PIECE_SCALE = 20;

// Node name → piece type mapping (use white piece nodes for geometry)
const PIECE_NODES = {
  pawn: "piece_pawn_white_01",
  rook: "piece_rook_white_01",
  knight: "piece_knight_white_01",
  bishop: "piece_bishop_white_01",
  queen: "piece_queen_white",
  king: "piece_king_white",
} as const;

type PieceType = keyof typeof PIECE_NODES;

export function useChessPiece(pieceType: PieceType) {
  const { nodes } = useGLTF(MODEL_PATH);
  const nodeName = PIECE_NODES[pieceType];
  const node = nodes[nodeName];

  // Some pieces (e.g. bishop) have multiple primitives and load as a Group
  // instead of a single Mesh. Collect all geometries from the node.
  const geometries: THREE.BufferGeometry[] = [];

  if ((node as THREE.Mesh).isMesh) {
    geometries.push((node as THREE.Mesh).geometry);
  } else {
    node.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        geometries.push((child as THREE.Mesh).geometry);
      }
    });
  }

  return { geometries, scale: PIECE_SCALE };
}

// Preload the model so it's ready when pieces render
useGLTF.preload(MODEL_PATH);

export { PIECE_SCALE };
