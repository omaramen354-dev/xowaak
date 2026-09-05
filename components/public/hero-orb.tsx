"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles, Trail } from "@react-three/drei";
import * as THREE from "three";

/**
 * Hero centrepiece — a full 3D object living in the hero's visual column.
 *
 * Layers, inside out:
 *   distorted core -> two wire shells -> equator ring -> orbiting satellites
 *   with light trails -> sparkle dust
 *
 * It is confined to its own grid cell, so it can never overlap the copy.
 * Pointer input only tilts it; the canvas itself stays pointer-events-none
 * on touch so it never steals a scroll gesture.
 */

/* ---------------- Pulsing distorted core ---------------- */
function Core() {
  const ref = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = t * 0.22;
      ref.current.rotation.x = Math.sin(t * 0.3) * 0.18;
    }
    if (light.current) {
      // Heartbeat — the core breathes light into the shells around it.
      light.current.intensity = 5.5 + Math.sin(t * 1.6) * 2.4;
    }
  });

  return (
    <group>
      <pointLight ref={light} position={[0, 0, 0]} color="#00F2FE" intensity={6} distance={9} />
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.05, 12]} />
        <MeshDistortMaterial
          color="#0B1220"
          emissive="#00F2FE"
          emissiveIntensity={0.55}
          roughness={0.18}
          metalness={0.92}
          distort={0.36}
          speed={1.4}
        />
      </mesh>
    </group>
  );
}

/* ---------------- Counter-rotating wire shells ---------------- */
function Shells() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (a.current) {
      a.current.rotation.y = t * 0.16;
      a.current.rotation.x = t * 0.1;
    }
    if (b.current) {
      b.current.rotation.y = -t * 0.12;
      b.current.rotation.z = t * 0.08;
    }
  });

  return (
    <>
      <mesh ref={a}>
        <icosahedronGeometry args={[1.75, 1]} />
        <meshBasicMaterial color="#00F2FE" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh ref={b}>
        <dodecahedronGeometry args={[2.25, 0]} />
        <meshBasicMaterial color="#D946EF" wireframe transparent opacity={0.22} />
      </mesh>
    </>
  );
}

/* ---------------- Equator ring ---------------- */
function Equator() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (!ref.current) return;
    ref.current.rotation.z = t * 0.3;
    ref.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.22;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[2.7, 0.014, 8, 180]} />
      <meshBasicMaterial color="#00F2FE" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ---------------- Orbiting satellite with a light trail ---------------- */
function Satellite({
  color,
  radius,
  speed,
  phase,
  tilt,
  size,
}: {
  color: string;
  radius: number;
  speed: number;
  phase: number;
  tilt: number;
  size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime * speed + phase;
    ref.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t) * radius * Math.sin(tilt),
      Math.sin(t) * radius * Math.cos(tilt),
    );
  });

  return (
    <Trail width={1.5} length={5} color={color} attenuation={(w) => w * w} decay={1.4}>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </Trail>
  );
}

/* ---------------- Damped pointer tilt ---------------- */
/**
 * The canvas is pointer-events:none so it can never swallow a click or a
 * touch scroll — which also means R3F's own `state.pointer` never updates.
 * We therefore track the cursor on `window` and normalise it ourselves.
 */
function Tilt({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    if (!g.current) return;
    g.current.rotation.y += (target.current.x * 0.4 - g.current.rotation.y) * 0.045;
    g.current.rotation.x += (-target.current.y * 0.28 - g.current.rotation.x) * 0.045;
  });

  return <group ref={g}>{children}</group>;
}

function Rig() {
  const satellites = useMemo(
    () => [
      { color: "#00F2FE", radius: 2.7, speed: 0.75, phase: 0, tilt: 0.3, size: 0.075 },
      { color: "#EC4899", radius: 3.15, speed: 0.55, phase: 2.2, tilt: 1.1, size: 0.065 },
      { color: "#10B981", radius: 2.35, speed: 0.95, phase: 4.1, tilt: 0.72, size: 0.055 },
      { color: "#8B5CF6", radius: 3.5, speed: 0.42, phase: 1.4, tilt: 1.45, size: 0.06 },
    ],
    [],
  );

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 4, 5]} color="#EC4899" intensity={22} distance={18} />
      <pointLight position={[-5, -3, 3]} color="#8B5CF6" intensity={18} distance={18} />
      <pointLight position={[0, 5, -4]} color="#10B981" intensity={14} distance={16} />

      <Tilt>
        <Float speed={1.4} rotationIntensity={0.32} floatIntensity={0.85}>
          <Core />
          <Shells />
          <Equator />
        </Float>

        {satellites.map((s) => (
          <Satellite key={s.color} {...s} />
        ))}

        <Sparkles count={70} scale={7} size={2.4} speed={0.35} opacity={0.6} color="#00F2FE" />
        <Sparkles count={40} scale={6} size={2} speed={0.28} opacity={0.5} color="#EC4899" />
      </Tilt>
    </>
  );
}

export function HeroOrb() {
  return (
    <div className="relative aspect-square w-full">
      {/* Glow pad behind the orb — backdrop layer, never over copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[10%] z-backdrop rounded-full bg-neon-cyan/20 blur-[90px] animate-pulse-glow"
      />
      <Canvas
        aria-hidden
        className="!pointer-events-none"
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 7.2], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Rig />
      </Canvas>
    </div>
  );
}

export default HeroOrb;
