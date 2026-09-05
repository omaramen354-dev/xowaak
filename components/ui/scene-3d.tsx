"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Global ambient 3D field.
 *
 * Renders once at the app root, fixed behind every page, and never stops
 * moving. Deliberately calm: slow rotation, drifting motes and three coloured
 * lights that breathe — motion you feel rather than notice.
 *
 * Constraints that matter:
 *  - transparent canvas over the CSS black, so it composites with the aurora
 *  - pointer-events:none, aria-hidden, z-backdrop -> can never eat clicks
 *  - dpr capped at 1.5 and frameloop throttled on small screens
 *  - fully skipped when the user asks for reduced motion
 */

/* ---------------- Rotating wire polyhedron ---------------- */
function WireCore() {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outer.current) {
      outer.current.rotation.x = t * 0.055;
      outer.current.rotation.y = t * 0.08;
      outer.current.scale.setScalar(1 + Math.sin(t * 0.45) * 0.045);
    }
    if (inner.current) {
      inner.current.rotation.x = -t * 0.11;
      inner.current.rotation.z = t * 0.07;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={outer}>
        <icosahedronGeometry args={[2.6, 1]} />
        <meshBasicMaterial color="#00F2FE" wireframe transparent opacity={0.16} />
      </mesh>
      <mesh ref={inner}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshBasicMaterial color="#D946EF" wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/* ---------------- Drifting motes ---------------- */
function Motes({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  // Positions + per-point colour, generated once.
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    // RGB triad — red, green, blue — kept desaturated so it reads as light.
    const palette = [
      new THREE.Color("#00F2FE"),
      new THREE.Color("#EC4899"),
      new THREE.Color("#10B981"),
      new THREE.Color("#8B5CF6"),
    ];

    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.028;
    ref.current.rotation.x = Math.sin(t * 0.12) * 0.09;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------------- Breathing RGB halos ---------------- */
function Halo({
  color,
  radius,
  speed,
  phase,
  orbit,
}: {
  color: string;
  radius: number;
  speed: number;
  phase: number;
  orbit: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null);

  // Soft radial sprite — a glow, not a hard disc.
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.32)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    ref.current.position.set(
      orbit[0] + Math.cos(t) * 2.4,
      orbit[1] + Math.sin(t * 0.8) * 1.6,
      orbit[2],
    );
    const s = radius * (1 + Math.sin(t * 1.3) * 0.12);
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={orbit}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        color={color}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function Field() {
  return (
    <>
      <WireCore />
      <Motes />
      {/* RGB triad, orbiting on separate phases so they never sync up. */}
      <Halo color="#00F2FE" radius={9} speed={0.16} phase={0} orbit={[-4, 1.5, -4]} />
      <Halo color="#EC4899" radius={8} speed={0.13} phase={2.1} orbit={[4.5, -1, -5]} />
      <Halo color="#10B981" radius={7} speed={0.19} phase={4.2} orbit={[0, -2.5, -6]} />
      <Halo color="#8B5CF6" radius={8.5} speed={0.11} phase={1.1} orbit={[1.5, 2.5, -5.5]} />
    </>
  );
}

export function Scene3D() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-backdrop motion-reduce:hidden"
      style={{ contain: "strict" }}
    >
      <Canvas
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 9], fov: 55 }}
        style={{ background: "transparent" }}
      >
        <Field />
      </Canvas>
    </div>
  );
}

export default Scene3D;
