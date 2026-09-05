"use client";

/* eslint-disable react-hooks/immutability -- three.js uniforms/refs are mutable by design */
import { Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group, Mesh, Points } from "three";
import * as THREE from "three";

const CYAN = new THREE.Color("#36efff");
const VIOLET = new THREE.Color("#8f6bff");
const MAGENTA = new THREE.Color("#e04dff");

/* ------------------------------ fresnel rim material ------------------------------ */

function useFresnelMaterial() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: CYAN.clone() },
          uColorB: { value: MAGENTA.clone() },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vPos;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(cameraPosition - world.xyz);
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vPos;
          void main() {
            float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.6);
            float bands = 0.55 + 0.45 * sin(vPos.y * 7.0 + uTime * 1.4);
            vec3 color = mix(uColorA, uColorB, 0.5 + 0.5 * sin(uTime * 0.5 + vPos.x * 2.0));
            float glow = rim * bands;
            gl_FragColor = vec4(color * glow * 1.9, glow);
          }
        `,
      }),
    [],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return material;
}

/* --------------------------------- particle cloud --------------------------------- */

function ParticleCloud() {
  const points = useRef<Points>(null);
  const { sphere, embers } = useMemo(() => {
    const buildCloud = (count: number, minR: number, maxR: number, squashY: number) => {
      const data = new Float32Array(count * 3);
      for (let index = 0; index < count; index += 1) {
        const radius = minR + ((index * 47) % 100) / (100 / (maxR - minR));
        const angle = index * 2.399;
        const height = Math.sin(index * 1.73) * squashY;
        data[index * 3] = Math.cos(angle) * radius;
        data[index * 3 + 1] = height;
        data[index * 3 + 2] = Math.sin(angle) * radius * 0.62;
      }
      return data;
    };
    return {
      sphere: buildCloud(340, 3.1, 6.2, 2.9),
      embers: buildCloud(120, 2.1, 3.2, 1.6),
    };
  }, []);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.016;
      points.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.07;
    }
  });

  return (
    <group>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sphere, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#6df4ff" size={0.024} transparent opacity={0.5} sizeAttenuation />
      </points>
      <points rotation={[0.4, 0.6, 0.2]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[embers, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#d469ff" size={0.03} transparent opacity={0.42} sizeAttenuation />
      </points>
    </group>
  );
}

/* ------------------------------- orbiting satellites ------------------------------- */

function Satellites() {
  const groupA = useRef<Group>(null);
  const groupB = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupA.current) groupA.current.rotation.z += delta * 0.32;
    if (groupB.current) groupB.current.rotation.z -= delta * 0.21;
  });

  return (
    <group>
      <group ref={groupA} rotation={[1.12, 0.1, 0.42]}>
        <mesh position={[1.92, 0, 0]}>
          <octahedronGeometry args={[0.09, 0]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} />
          <pointLight color="#36efff" intensity={3} distance={2.4} />
        </mesh>
        <mesh position={[-1.92, 0, 0]} scale={0.7}>
          <octahedronGeometry args={[0.09, 0]} />
          <meshBasicMaterial color={VIOLET} toneMapped={false} />
        </mesh>
      </group>
      <group ref={groupB} rotation={[0.28, 1.08, -0.24]}>
        <mesh position={[2.16, 0, 0]}>
          <tetrahedronGeometry args={[0.11, 0]} />
          <meshBasicMaterial color={MAGENTA} toneMapped={false} />
          <pointLight color="#e04dff" intensity={2.4} distance={2.2} />
        </mesh>
      </group>
    </group>
  );
}

/* ----------------------------------- energy core ----------------------------------- */

function EnergyCore() {
  const root = useRef<Group>(null);
  const shell = useRef<Mesh>(null);
  const rim = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);
  const ringC = useRef<Mesh>(null);
  const cursor = useRef({ x: 0, y: 0 });
  const fresnelMaterial = useFresnelMaterial();

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
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, cursor.current.x * 0.3, 0.03);
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, -cursor.current.y * 0.16, 0.03);
      root.current.position.y = Math.sin(elapsed * 0.6) * 0.14;
    }
    if (shell.current) {
      shell.current.rotation.y -= delta * 0.11;
      shell.current.rotation.x += delta * 0.05;
    }
    if (rim.current) {
      rim.current.rotation.y -= delta * 0.11;
      rim.current.rotation.x += delta * 0.05;
    }
    if (inner.current) {
      inner.current.rotation.z -= delta * 0.2;
      const pulse = 0.92 + Math.sin(elapsed * 1.8) * 0.04;
      inner.current.scale.setScalar(pulse);
    }
    if (ringA.current) ringA.current.rotation.z += delta * 0.12;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.08;
    if (ringC.current) ringC.current.rotation.z += delta * 0.05;
  });

  return (
    <group ref={root} rotation={[0.1, -0.25, -0.08]}>
      <Float speed={1.6} rotationIntensity={0.12} floatIntensity={0.18}>
        {/* dark solid body */}
        <mesh ref={shell}>
          <icosahedronGeometry args={[1.3, 4]} />
          <meshPhysicalMaterial
            color="#04070e"
            emissive="#062231"
            emissiveIntensity={0.55}
            metalness={0.9}
            roughness={0.22}
            clearcoat={1}
            clearcoatRoughness={0.16}
            flatShading
          />
        </mesh>
        {/* fresnel neon rim */}
        <mesh ref={rim} scale={1.015} material={fresnelMaterial}>
          <icosahedronGeometry args={[1.3, 4]} />
        </mesh>
        {/* inner wire lattice */}
        <mesh ref={inner} scale={0.93}>
          <icosahedronGeometry args={[1.32, 2]} />
          <meshBasicMaterial color="#48efff" wireframe transparent opacity={0.42} toneMapped={false} />
        </mesh>
        {/* plasma heart */}
        <mesh scale={0.5}>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshBasicMaterial color="#a55dff" transparent opacity={0.16} toneMapped={false} />
        </mesh>
      </Float>

      {/* orbital rings */}
      <mesh ref={ringA} rotation={[1.12, 0.1, 0.42]}>
        <torusGeometry args={[1.92, 0.02, 12, 200]} />
        <meshBasicMaterial color="#31edff" transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} rotation={[0.28, 1.08, -0.24]}>
        <torusGeometry args={[2.16, 0.012, 12, 200]} />
        <meshBasicMaterial color="#d84dff" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh ref={ringC} rotation={[0.76, -0.72, 0.08]}>
        <torusGeometry args={[2.46, 0.006, 8, 200]} />
        <meshBasicMaterial color="#8470ff" transparent opacity={0.28} toneMapped={false} />
      </mesh>
      <Satellites />
    </group>
  );
}

/* -------------------------------------- scene -------------------------------------- */

function Scene() {
  const scene = useRef<Group>(null);

  useFrame((state) => {
    if (scene.current) scene.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.15) * 0.028;
  });

  return (
    <group ref={scene}>
      <ambientLight intensity={0.35} color="#a9d9ff" />
      <pointLight position={[3.2, 2.2, 4]} color="#36efff" intensity={26} distance={9} />
      <pointLight position={[-3.4, -1.4, 2.4]} color="#c444ff" intensity={17} distance={8} />
      <spotLight position={[0, 4, 3]} angle={0.5} penumbra={1} intensity={12} color="#2a5cff" distance={10} />
      <ParticleCloud />
      <EnergyCore />
      <Sparkles count={70} scale={[6.5, 4, 4]} size={2} speed={0.35} color="#63f2ff" opacity={0.5} />
      <Sparkles count={40} scale={[7, 5, 5]} size={1.6} speed={0.25} color="#b26bff" opacity={0.4} />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="hero-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.1, 7.4], fov: 41, near: 0.1, far: 44 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
