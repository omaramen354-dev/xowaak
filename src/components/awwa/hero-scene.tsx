"use client";

import { Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group, Mesh, Points } from "three";
import * as THREE from "three";

function ParticleCloud() {
  const points = useRef<Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(240 * 3);
    for (let index = 0; index < 240; index += 1) {
      const radius = 3.2 + ((index * 47) % 100) / 36;
      const angle = index * 2.399;
      const height = Math.sin(index * 1.73) * 2.8;
      data[index * 3] = Math.cos(angle) * radius;
      data[index * 3 + 1] = height;
      data[index * 3 + 2] = Math.sin(angle) * radius * 0.58;
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.018;
      points.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.11) * 0.08;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#61f7ff" size={0.025} transparent opacity={0.52} sizeAttenuation />
    </points>
  );
}

function OrbitNodes() {
  const group = useRef<Group>(null);
  const nodes = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) => {
        const angle = (index / 9) * Math.PI * 2;
        const radius = index % 2 === 0 ? 2.28 : 1.82;
        return {
          position: [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.48, Math.sin(angle * 2) * 0.48] as [
            number,
            number,
            number,
          ],
          color: index % 3 === 0 ? "#fb4aff" : index % 3 === 1 ? "#33efff" : "#8f6bff",
          size: index % 3 === 0 ? 0.075 : 0.045,
        };
      }),
    [],
  );

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.z -= delta * 0.075;
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.18;
    }
  });

  return (
    <group ref={group}>
      {nodes.map((node, index) => (
        <mesh key={index} position={node.position}>
          <sphereGeometry args={[node.size, 12, 12]} />
          <meshBasicMaterial color={node.color} toneMapped={false} />
          <pointLight color={node.color} intensity={0.8} distance={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function EnergyCore() {
  const root = useRef<Group>(null);
  const shell = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);
  const cursor = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      cursor.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      cursor.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", handlePointer, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointer);
  }, []);

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;
    if (root.current) {
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, cursor.current.x * 0.22, 0.025);
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, -cursor.current.y * 0.12, 0.025);
      root.current.position.y = Math.sin(elapsed * 0.62) * 0.12;
    }
    if (shell.current) {
      shell.current.rotation.x += delta * 0.07;
      shell.current.rotation.y -= delta * 0.12;
    }
    if (inner.current) {
      inner.current.rotation.z -= delta * 0.18;
      const pulse = 0.91 + Math.sin(elapsed * 1.7) * 0.035;
      inner.current.scale.setScalar(pulse);
    }
    if (ringA.current) ringA.current.rotation.z += delta * 0.11;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.075;
  });

  return (
    <group ref={root} rotation={[0.12, -0.2, -0.08]}>
      <Float speed={1.5} rotationIntensity={0.12} floatIntensity={0.16}>
        <mesh ref={shell}>
          <icosahedronGeometry args={[1.26, 2]} />
          <meshPhysicalMaterial
            color="#07101b"
            emissive="#05253a"
            emissiveIntensity={0.8}
            metalness={0.88}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.12}
            flatShading
          />
        </mesh>
        <mesh ref={inner} scale={0.91}>
          <icosahedronGeometry args={[1.25, 2]} />
          <meshBasicMaterial color="#48efff" wireframe transparent opacity={0.54} toneMapped={false} />
        </mesh>
        <mesh scale={0.63}>
          <icosahedronGeometry args={[1.24, 1]} />
          <meshBasicMaterial color="#bd55ff" transparent opacity={0.13} toneMapped={false} />
        </mesh>
      </Float>

      <mesh ref={ringA} rotation={[1.12, 0.1, 0.42]}>
        <torusGeometry args={[1.9, 0.018, 12, 180]} />
        <meshBasicMaterial color="#31edff" transparent opacity={0.82} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} rotation={[0.28, 1.08, -0.24]}>
        <torusGeometry args={[2.14, 0.012, 12, 180]} />
        <meshBasicMaterial color="#d64aff" transparent opacity={0.52} toneMapped={false} />
      </mesh>
      <mesh rotation={[0.76, -0.72, 0.08]}>
        <torusGeometry args={[2.42, 0.007, 8, 180]} />
        <meshBasicMaterial color="#8470ff" transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <OrbitNodes />
    </group>
  );
}

function Scene() {
  const scene = useRef<Group>(null);

  useFrame((state) => {
    if (scene.current) scene.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.16) * 0.025;
  });

  return (
    <group ref={scene}>
      <ambientLight intensity={0.32} color="#a9d9ff" />
      <pointLight position={[3, 2, 4]} color="#36efff" intensity={22} distance={8} />
      <pointLight position={[-3, -1, 2]} color="#c444ff" intensity={15} distance={7} />
      <ParticleCloud />
      <EnergyCore />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="hero-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7.2], fov: 42, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
