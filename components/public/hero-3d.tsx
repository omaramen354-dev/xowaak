"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Icosahedron, Line, Points, PointMaterial } from "@react-three/drei";
import { AdditiveBlending, MathUtils, type Group, type Mesh, type Points as ThreePoints } from "three";

/**
 * Interactive holographic tech core.
 *
 *  - Wireframe icosahedron shell (cyan emissive edges)
 *  - Inner solid core with purple emissive material
 *  - Orbiting holographic particle ring (additive blended)
 *  - Three inclined orbit lines
 *
 * The whole rig orbits toward the pointer with an eased lerp (gyroscope tilt).
 */

function ParticleRing({ count = 900 }: { count?: number }) {
  const ref = useRef<ThreePoints>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute in a torus band so it reads as a ring, not a cloud.
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.1 + (Math.random() - 0.5) * 0.55;
      const height = (Math.random() - 0.5) * 0.35;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = height;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.16;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
  });

  return (
    <group rotation={[0.42, 0, 0.16]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          size={0.045}
          sizeAttenuation
          depthWrite={false}
          color="#00F2FE"
          opacity={0.9}
          blending={AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function OrbitLine({ radius, tilt, color, speed }: { radius: number; tilt: number; color: string; speed: number }) {
  const ref = useRef<Group>(null);

  const points = useMemo<[number, number, number][]>(
    () =>
      Array.from({ length: 129 }, (_, i) => {
        const a = (i / 128) * Math.PI * 2;
        return [Math.cos(a) * radius, 0, Math.sin(a) * radius];
      }),
    [radius],
  );

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });

  return (
    <group ref={ref} rotation={[tilt, 0, tilt * 0.45]}>
      <Line points={points} color={color} lineWidth={1} transparent opacity={0.35} />
    </group>
  );
}

function TechCore() {
  const rig = useRef<Group>(null);
  const shell = useRef<Mesh>(null);
  const core = useRef<Mesh>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (rig.current) {
      // Mouse orbit — eased so it glides rather than snaps.
      rig.current.rotation.y = MathUtils.lerp(rig.current.rotation.y, pointer.x * 0.75, 0.055);
      rig.current.rotation.x = MathUtils.lerp(rig.current.rotation.x, -pointer.y * 0.45, 0.055);
    }
    if (shell.current) {
      shell.current.rotation.y += delta * 0.14;
      shell.current.rotation.z += delta * 0.05;
    }
    if (core.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.06;
      core.current.scale.setScalar(pulse);
      core.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <group ref={rig}>
      <Float speed={1.3} rotationIntensity={0.3} floatIntensity={0.85}>
        {/* Outer wireframe shell */}
        <Icosahedron ref={shell} args={[2.25, 1]}>
          <meshBasicMaterial wireframe color="#00F2FE" transparent opacity={0.42} />
        </Icosahedron>

        {/* Inner glowing core */}
        <Icosahedron ref={core} args={[1.15, 1]}>
          <meshStandardMaterial
            color="#4FACFE"
            emissive="#A855F7"
            emissiveIntensity={1.5}
            roughness={0.18}
            metalness={0.9}
            flatShading
          />
        </Icosahedron>

        <ParticleRing />

        <OrbitLine radius={2.9} tilt={1.1} color="#00F2FE" speed={0.26} />
        <OrbitLine radius={3.45} tilt={-0.65} color="#A855F7" speed={-0.19} />
        <OrbitLine radius={2.6} tilt={0.32} color="#4FACFE" speed={0.36} />
      </Float>
    </group>
  );
}

export function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8.5], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.55} />
        <pointLight position={[6, 6, 6]} intensity={2.6} color="#00F2FE" />
        <pointLight position={[-6, -3, 4]} intensity={2} color="#A855F7" />
        <pointLight position={[0, 5, -6]} intensity={1.3} color="#4FACFE" />
        <TechCore />
      </Suspense>
    </Canvas>
  );
}

export default Hero3D;
