"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Global ambient 3D field.
 *
 * Renders once at the app root, fixed behind every page, and never stops
 * moving. Depth is built in layers, far -> near:
 *   stars -> nebula wash -> grid floor -> orbit rings -> motes -> sparkles
 *
 * Constraints that matter:
 *  - transparent canvas over the CSS black, so it composites with the aurora
 *  - pointer-events:none, aria-hidden, z-backdrop -> can never eat clicks
 *  - dpr capped, additive blending everywhere (adds light, never grey haze)
 *  - the whole thing is skipped for reduced-motion / phones (see scene-mount)
 */

/* ---------------- Soft radial sprite, shared by halos ---------------- */
function useGlowTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.32)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* ---------------- Rotating wire core ---------------- */
function WireCore() {
  const outer = useRef<THREE.Mesh>(null);
  const mid = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (outer.current) {
      outer.current.rotation.x = t * 0.055;
      outer.current.rotation.y = t * 0.08;
      outer.current.scale.setScalar(1 + Math.sin(t * 0.45) * 0.05);
    }
    if (mid.current) {
      mid.current.rotation.y = -t * 0.09;
      mid.current.rotation.z = t * 0.04;
    }
    if (inner.current) {
      inner.current.rotation.x = -t * 0.11;
      inner.current.rotation.z = t * 0.07;
    }
  });

  return (
    <group>
      <mesh ref={outer}>
        <icosahedronGeometry args={[2.9, 1]} />
        <meshBasicMaterial color="#00F2FE" wireframe transparent opacity={0.14} />
      </mesh>
      <mesh ref={mid}>
        <dodecahedronGeometry args={[2.1, 0]} />
        <meshBasicMaterial color="#8B5CF6" wireframe transparent opacity={0.15} />
      </mesh>
      <mesh ref={inner}>
        <octahedronGeometry args={[1.4, 0]} />
        <meshBasicMaterial color="#D946EF" wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/* ---------------- Tilted orbit rings ---------------- */
function OrbitRings() {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (!g.current) return;
    g.current.rotation.z = t * 0.05;
    g.current.rotation.x = Math.PI / 2.6 + Math.sin(t * 0.16) * 0.12;
  });

  const rings: { r: number; c: string; o: number }[] = [
    { r: 4.2, c: "#00F2FE", o: 0.3 },
    { r: 5.4, c: "#EC4899", o: 0.22 },
    { r: 6.8, c: "#10B981", o: 0.16 },
  ];

  return (
    <group ref={g}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={[0, 0, i * 0.5]}>
          <torusGeometry args={[ring.r, 0.008, 8, 160]} />
          <meshBasicMaterial
            color={ring.c}
            transparent
            opacity={ring.o}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Receding grid floor ---------------- */
function GridFloor() {
  const ref = useRef<THREE.LineSegments>(null);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts: number[] = [];
    const half = 22;
    const step = 1.6;
    for (let i = -half; i <= half; i += step) {
      pts.push(-half, 0, i, half, 0, i);
      pts.push(i, 0, -half, i, 0, half);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame((s) => {
    if (!ref.current) return;
    // Slow forward crawl, wrapped so it never visibly restarts.
    ref.current.position.z = (s.clock.elapsedTime * 0.35) % 1.6;
  });

  return (
    <group position={[0, -5.5, -6]} rotation={[0, 0, 0]}>
      <lineSegments ref={ref} geometry={geo}>
        <lineBasicMaterial
          color="#00F2FE"
          transparent
          opacity={0.075}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

/* ---------------- Drifting RGB motes ---------------- */
function Motes({ count = 620 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#00F2FE"),
      new THREE.Color("#EC4899"),
      new THREE.Color("#10B981"),
      new THREE.Color("#8B5CF6"),
    ];
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 9;
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

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
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
        size={0.05}
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

/* ---------------- Breathing RGB halo ---------------- */
function Halo({
  color,
  radius,
  speed,
  phase,
  orbit,
  map,
}: {
  color: string;
  radius: number;
  speed: number;
  phase: number;
  orbit: [number, number, number];
  map: THREE.Texture;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime * speed + phase;
    ref.current.position.set(orbit[0] + Math.cos(t) * 2.6, orbit[1] + Math.sin(t * 0.8) * 1.8, orbit[2]);
    ref.current.scale.setScalar(radius * (1 + Math.sin(t * 1.3) * 0.13));
  });

  return (
    <mesh ref={ref} position={orbit}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={map}
        color={color}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------- Slow parallax on pointer ---------------- */
function Parallax({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!g.current) return;
    // Damped follow — the field leans toward the cursor, it never snaps.
    g.current.rotation.y += (s.pointer.x * 0.18 - g.current.rotation.y) * 0.02;
    g.current.rotation.x += (-s.pointer.y * 0.12 - g.current.rotation.x) * 0.02;
  });
  return <group ref={g}>{children}</group>;
}

function Field() {
  const glow = useGlowTexture();

  return (
    <>
      {/* Far layer — never parallaxes, so depth reads correctly. */}
      <Stars radius={70} depth={40} count={1400} factor={3.2} saturation={0} fade speed={0.5} />

      <Parallax>
        <GridFloor />
        <OrbitRings />
        <WireCore />
        <Motes />

        {/* Fireflies drifting through the whole volume. */}
        <Sparkles count={90} scale={16} size={2.6} speed={0.32} opacity={0.55} color="#00F2FE" />
        <Sparkles count={60} scale={13} size={2.2} speed={0.25} opacity={0.45} color="#EC4899" />
        <Sparkles count={45} scale={11} size={2} speed={0.2} opacity={0.4} color="#10B981" />

        {/* RGB triad + violet, unequal periods so they never sync up. */}
        <Halo map={glow} color="#00F2FE" radius={9} speed={0.16} phase={0} orbit={[-4, 1.5, -4]} />
        <Halo map={glow} color="#EC4899" radius={8} speed={0.13} phase={2.1} orbit={[4.5, -1, -5]} />
        <Halo map={glow} color="#10B981" radius={7} speed={0.19} phase={4.2} orbit={[0, -2.5, -6]} />
        <Halo map={glow} color="#8B5CF6" radius={8.5} speed={0.11} phase={1.1} orbit={[1.5, 2.5, -5.5]} />
      </Parallax>
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
