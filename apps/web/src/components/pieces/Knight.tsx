"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface PieceProps {
  color: string;
}

function createHorseHeadGeometry(): THREE.BufferGeometry {
  // Spine curve: smooth path from neck base, up through head, forward to muzzle
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.00, 0.02),   // neck base (slightly behind center)
    new THREE.Vector3(0, 0.06, 0.02),   // lower neck
    new THREE.Vector3(0, 0.14, 0.00),   // mid neck
    new THREE.Vector3(0, 0.22, -0.02),  // upper neck
    new THREE.Vector3(0, 0.30, -0.05),  // poll/crest area
    new THREE.Vector3(0, 0.38, -0.10),  // forehead
    new THREE.Vector3(0, 0.42, -0.16),  // upper face
    new THREE.Vector3(0, 0.40, -0.22),  // nose bridge
    new THREE.Vector3(0, 0.36, -0.27),  // lower face
    new THREE.Vector3(0, 0.32, -0.30),  // muzzle
    new THREE.Vector3(0, 0.29, -0.33),  // nose tip
  ]);

  // Cross-section dims at each spine control point: [width (X), depth (perp)]
  const dims: [number, number][] = [
    [0.12, 0.12],  // neck base - circular to match pedestal
    [0.13, 0.12],  // lower neck
    [0.14, 0.13],  // mid neck
    [0.16, 0.15],  // upper neck - jowl area, widest
    [0.15, 0.14],  // poll
    [0.13, 0.12],  // forehead
    [0.11, 0.10],  // upper face
    [0.10, 0.09],  // nose bridge
    [0.09, 0.08],  // lower face
    [0.11, 0.07],  // muzzle - wider, flatter
    [0.09, 0.06],  // nose tip
  ];

  const numSlices = 30;
  const numRing = 16;
  const xAxis = new THREE.Vector3(1, 0, 0);

  const vertices: number[] = [];
  const indices: number[] = [];

  let prevDepthDir = new THREE.Vector3(0, 0, -1);

  for (let i = 0; i <= numSlices; i++) {
    const t = i / numSlices;
    const point = spine.getPointAt(t);
    const tangent = spine.getTangentAt(t).normalize();

    // Compute perpendicular depth direction
    const depthDir = new THREE.Vector3().crossVectors(tangent, xAxis).normalize();

    // Prevent flipping
    if (depthDir.dot(prevDepthDir) < 0) {
      depthDir.negate();
    }
    prevDepthDir.copy(depthDir);

    // Interpolate cross-section dimensions
    const sIdx = t * (dims.length - 1);
    const si = Math.min(Math.floor(sIdx), dims.length - 2);
    const sf = sIdx - si;
    const w = dims[si][0] * (1 - sf) + dims[si + 1][0] * sf;
    const d = dims[si][1] * (1 - sf) + dims[si + 1][1] * sf;

    for (let j = 0; j < numRing; j++) {
      const angle = (j / numRing) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Mane ridge on the back of the neck
      // Back is when sinA > 0 (since depthDir points forward toward nose)
      let effD = d;
      if (t < 0.55) {
        const backFactor = Math.max(0, sinA);
        const maneStrength = backFactor * backFactor * (1 - t / 0.55) * 0.06;
        effD += maneStrength;
      }

      // Slight jaw widening at the cheek level
      if (t > 0.2 && t < 0.5) {
        const jawFactor = Math.max(0, -cosA) * 0.015;
        const jawStrength = Math.sin((t - 0.2) / 0.3 * Math.PI);
        effD += jawFactor * jawStrength;
      }

      const ox = cosA * w;
      const oy = sinA * effD * depthDir.y;
      const oz = sinA * effD * depthDir.z;

      vertices.push(point.x + ox, point.y + oy, point.z + oz);
    }
  }

  // Body triangles - connect adjacent rings
  for (let i = 0; i < numSlices; i++) {
    for (let j = 0; j < numRing; j++) {
      const a = i * numRing + j;
      const b = i * numRing + (j + 1) % numRing;
      const c = (i + 1) * numRing + j;
      const d = (i + 1) * numRing + (j + 1) % numRing;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  // Bottom cap (neck base)
  const bottomCenter = vertices.length / 3;
  const p0 = spine.getPointAt(0);
  vertices.push(p0.x, p0.y, p0.z);
  for (let j = 0; j < numRing; j++) {
    indices.push(bottomCenter, j, (j + 1) % numRing);
  }

  // Top cap (nose tip)
  const topCenter = vertices.length / 3;
  const pEnd = spine.getPointAt(1);
  vertices.push(pEnd.x, pEnd.y, pEnd.z);
  const lastRing = numSlices * numRing;
  for (let j = 0; j < numRing; j++) {
    indices.push(topCenter, lastRing + (j + 1) % numRing, lastRing + j);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

export function Knight({ color }: PieceProps) {
  const baseGeometry = useMemo(() => {
    const pts = [
      [0, 0],
      [0.30, 0], [0.32, 0.02], [0.32, 0.05],
      [0.28, 0.07], [0.33, 0.09], [0.32, 0.11], [0.27, 0.13],
      [0.20, 0.17], [0.16, 0.22],
      [0.14, 0.26], [0.13, 0.30],
      [0.14, 0.32], [0.17, 0.34], [0.18, 0.355], [0.17, 0.37], [0.14, 0.39],
      [0.12, 0.41], [0, 0.41],
    ].map(([x, y]) => new THREE.Vector2(x, y));

    const geo = new THREE.LatheGeometry(pts, 32);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const headGeometry = useMemo(() => createHorseHeadGeometry(), []);

  return (
    <group>
      {/* Lathe base/pedestal */}
      <mesh geometry={baseGeometry}>
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
      </mesh>

      {/* Horse head - positioned on top of base */}
      <group position={[0, 0.41, 0]}>
        <mesh geometry={headGeometry}>
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
        </mesh>

        {/* Left ear */}
        <mesh position={[-0.06, 0.44, -0.12]} rotation={[-0.4, 0, -0.35]}>
          <coneGeometry args={[0.025, 0.08, 4]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
        </mesh>

        {/* Right ear */}
        <mesh position={[0.06, 0.44, -0.12]} rotation={[-0.4, 0, 0.35]}>
          <coneGeometry args={[0.025, 0.08, 4]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
        </mesh>

        {/* Mane crest - thin ridge along back of neck */}
        <mesh position={[0, 0.22, 0.06]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.015, 0.30, 0.04]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
        </mesh>

        {/* Nostril hints */}
        <mesh position={[-0.045, 0.30, -0.34]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.0} />
        </mesh>
        <mesh position={[0.045, 0.30, -0.34]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.0} />
        </mesh>
      </group>
    </group>
  );
}
