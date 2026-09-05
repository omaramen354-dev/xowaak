"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Icosahedron, Line, TorusKnot } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { MathUtils } from "three";

/**
 * Interactive 3D core: a wireframe icosahedron shell wrapping a glowing
 * torus knot, reacting to pointer movement. Deliberately low-poly and
 * dependency-light so it stays smooth on modest hardware.
 */
function CoreObject() {
  const group = useRef<Group>(null);
  const shell = useRef<Mesh>(null);
  const knot = useRef<Mesh>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!group.current) return;
    // Follow the cursor with an eased spring-like lerp.
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, pointer.x * 0.8, 0.06);
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.5, 0.06);

    if (shell.current) {
      shell.current.rotation.y += delta * 0.18;
      shell.current.rotation.z += delta * 0.07;
    }
    if (knot.current) {
      knot.current.rotation.x -= delta * 0.35;
      knot.current.rotation.y += delta * 0.22;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.05;
      knot.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.9}>
        {/* Outer wireframe shell */}
        <Icosahedron ref={shell} args={[2.35, 1]}>
          <meshBasicMaterial wireframe color="#22d3ee" transparent opacity={0.34} />
        </Icosahedron>

        {/* Inner energy core */}
        <TorusKnot ref={knot} args={[0.85, 0.26, 160, 26]}>
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#22d3ee"
            emissiveIntensity={1.35}
            roughness={0.16}
            metalness={0.92}
          />
        </TorusKnot>

        {/* Orbiting rings */}
        <OrbitRing radius={3.0} tilt={1.15} color="#22d3ee" speed={0.28} />
        <OrbitRing radius={3.5} tilt={-0.7} color="#a78bfa" speed={-0.2} />
        <OrbitRing radius={2.7} tilt={0.35} color="#34d399" speed={0.4} />
      </Float>
    </group>
  );
}

function OrbitRing({
  radius,
  tilt,
  color,
  speed,
}: {
  radius: number;
  tilt: number;
  color: string;
  speed: number;
}) {
  const ref = useRef<Group>(null);
  const points: [number, number, number][] = Array.from({ length: 97 }, (_, i) => {
    const angle = (i / 96) * Math.PI * 2;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });

  return (
    <group ref={ref} rotation={[tilt, 0, tilt * 0.4]}>
      <Line points={points} color={color} lineWidth={1} transparent opacity={0.42} />
    </group>
  );
}

export function Hero3D() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        dpr={[1, 1.7]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[6, 6, 6]} intensity={2.4} color="#22d3ee" />
          <pointLight position={[-6, -3, 4]} intensity={1.8} color="#a78bfa" />
          <pointLight position={[0, 5, -6]} intensity={1.2} color="#34d399" />
          <CoreObject />
        </Suspense>
      </Canvas>
    </div>
  );
}
