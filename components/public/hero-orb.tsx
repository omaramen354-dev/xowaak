"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles, Trail } from "@react-three/drei";
import * as THREE from "three";
import { neonAt } from "@/lib/neon-cycle";

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

/* ---------------- Neon rim shader ---------------- */
/**
 * Fresnel rim light. The body stays pure black; brightness rises only at
 * grazing angles, so we read a black silhouette wrapped in a neon halo.
 * `uColor` is animated through the RGB palette on the CPU each frame.
 */
const rimVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const rimFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = 1.0 - abs(dot(normalize(vNormal), normalize(vView)));
    f = pow(clamp(f, 0.0, 1.0), uPower) * uIntensity;
    gl_FragColor = vec4(uColor * f, f);
  }
`;

/* ---------------- Black core with a travelling neon halo ---------------- */
function Core() {
  const body = useRef<THREE.Mesh>(null);
  const rim = useRef<THREE.Mesh>(null);
  const glowLight = useRef<THREE.PointLight>(null);

  const rimMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: rimVertex,
        fragmentShader: rimFragment,
        uniforms: {
          uColor: { value: new THREE.Color("#00F2FE") },
          uPower: { value: 2.6 },
          uIntensity: { value: 1.5 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [],
  );

  const scratch = useMemo(() => new THREE.Color(), []);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    neonAt(t, scratch);

    if (body.current) {
      body.current.rotation.y = t * 0.22;
      body.current.rotation.x = Math.sin(t * 0.3) * 0.18;
    }
    if (rim.current) {
      rim.current.rotation.y = t * 0.22;
      rim.current.rotation.x = Math.sin(t * 0.3) * 0.18;
      // Halo breathes in and out around the silhouette.
      rim.current.scale.setScalar(1.1 + Math.sin(t * 1.5) * 0.05);
    }
    rimMat.uniforms.uColor.value.copy(scratch);
    rimMat.uniforms.uIntensity.value = 1.35 + Math.sin(t * 1.5) * 0.45;

    if (glowLight.current) {
      glowLight.current.color.copy(scratch);
      glowLight.current.intensity = 5 + Math.sin(t * 1.5) * 2.2;
    }
  });

  return (
    <group>
      {/* Casts the current neon colour onto the shells around it. */}
      <pointLight ref={glowLight} position={[0, 0, 0]} color="#00F2FE" intensity={6} distance={10} />

      {/* Pure black body — no emissive, so it reads as a silhouette. */}
      <mesh ref={body}>
        <icosahedronGeometry args={[1.05, 12]} />
        <MeshDistortMaterial color="#000000" roughness={0.35} metalness={0.6} distort={0.36} speed={1.4} />
      </mesh>

      {/* Slightly larger back-faced hull carrying the fresnel halo. */}
      <mesh ref={rim} material={rimMat}>
        <icosahedronGeometry args={[1.05, 6]} />
      </mesh>
    </group>
  );
}

/* ---------------- Counter-rotating wire shells ---------------- */
function Shells() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const matA = useRef<THREE.MeshBasicMaterial>(null);
  const matB = useRef<THREE.MeshBasicMaterial>(null);
  const scratch = useMemo(() => new THREE.Color(), []);

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
    // Offset phases so the two shells are never the same hue at once.
    if (matA.current) {
      neonAt(t, scratch);
      matA.current.color.copy(scratch);
    }
    if (matB.current) {
      neonAt(t + 9, scratch);
      matB.current.color.copy(scratch);
    }
  });

  return (
    <>
      <mesh ref={a}>
        <icosahedronGeometry args={[1.75, 1]} />
        <meshBasicMaterial ref={matA} wireframe transparent opacity={0.32} />
      </mesh>
      <mesh ref={b}>
        <dodecahedronGeometry args={[2.25, 0]} />
        <meshBasicMaterial ref={matB} wireframe transparent opacity={0.24} />
      </mesh>
    </>
  );
}

/* ---------------- Equator ring ---------------- */
function Equator() {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const scratch = useMemo(() => new THREE.Color(), []);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.z = t * 0.3;
      ref.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.22;
    }
    if (mat.current) {
      neonAt(t + 4.5, scratch);
      mat.current.color.copy(scratch);
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[2.7, 0.014, 8, 180]} />
      <meshBasicMaterial ref={mat} transparent opacity={0.55} blending={THREE.AdditiveBlending} />
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
