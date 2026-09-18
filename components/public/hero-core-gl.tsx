"use client";

import { useEffect, useRef } from "react";
import { Camera, Geometry, Mesh, Program, Renderer, Transform, Vec3 } from "ogl";

/**
 * CoreGL — the interactive 3D rig behind the hero.
 *
 * Built directly on ogl (already a dependency of this codebase). Layers:
 *
 *   1. Wireframe icosphere "core"  — breathing, slowly rotating, pointer-tilt
 *   2. Inner energy shell          — fresnel-rim shader, additive blend
 *   3. Holographic particle ring   — 2000 GPU points orbiting the core
 *   4. Floor grid plane            — shader-drawn grid with radial falloff
 *   5. Twinkling star dust         — far-field points, parallax with pointer
 *
 * Interaction model:
 *   - Pointer position tilts the whole rig with damped easing (gyroscope feel)
 *   - Press-and-hold anywhere pulls the rig into an "engaged" state:
 *     camera dollies in, glow and rotation speed rise, palette shifts magenta
 *   - Continuous idle orbit so nothing is static even without input
 *
 * Performance contract:
 *   - DPR clamped to 1.6; loop skipped when tab hidden or hero off-screen
 *   - No per-frame allocations in steady state
 *   - Cleanup releases the GL context on unmount
 */

const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ */
/* Geometry: subdivided icosahedron                                    */
/* ------------------------------------------------------------------ */

function icosphere(subdiv: number): { verts: number[][]; faces: number[][] } {
  const t = (1 + Math.sqrt(5)) / 2;
  const verts: number[][] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  let faces: number[][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  const cache = new Map<string, number>();
  const midpoint = (a: number, b: number): number => {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    const hit = cache.get(key);
    if (hit !== undefined) return hit;
    const va = verts[a];
    const vb = verts[b];
    verts.push([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2]);
    const idx = verts.length - 1;
    cache.set(key, idx);
    return idx;
  };

  for (let s = 0; s < subdiv; s++) {
    const next: number[][] = [];
    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }

  const unit = verts.map((v) => {
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / len, v[1] / len, v[2] / len];
  });
  return { verts: unit, faces };
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

/** Shared hash/value noise (compact, correct, no derivatives). */
const GLSL_NOISE = /* glsl */ `
  float hash3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float vnoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z);
  }
`;

const CORE_VERT = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform float uTime;
  uniform float uEngage;

  varying vec3 vNormal;
  varying vec3 vView;

  ${GLSL_NOISE}

  void main() {
    vec3 dir = normalize(position);

    // Breathing: surface vertices pulse outward along their normals.
    float breathe = 1.0 + 0.045 * sin(uTime * 1.4 + position.y * 2.2) + uEngage * 0.10 * sin(uTime * 4.2);
    // Low-frequency turbulence keeps the shell alive between pulses.
    float turb = vnoise(dir * 2.6 + uTime * 0.22) * 0.05;

    vec3 pos = position + dir * (breathe - 1.0 + turb);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * dir);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const CORE_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uEngage;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.2);
    vec3 cyan = vec3(0.0, 0.95, 1.0);
    vec3 violet = vec3(0.545, 0.36, 0.96);
    vec3 magenta = vec3(0.85, 0.27, 0.93);

    float scan = 0.5 + 0.5 * sin(vNormal.y * 26.0 - uTime * 1.8);

    vec3 col = mix(cyan, violet, fres);
    col = mix(col, magenta, uEngage * 0.45 * (0.5 + 0.5 * sin(uTime * 2.0)));
    col += scan * 0.06 * (0.35 + uEngage);
    col *= (0.75 + fres * 1.65 + uEngage * 0.4);

    float alpha = clamp(fres * 1.5 + 0.06 + uEngage * 0.1, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

const SHELL_VERT = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform float uTime;
  uniform float uEngage;

  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float breathe = 1.0 + 0.03 * sin(uTime * 1.2) + uEngage * 0.05 * sin(uTime * 3.6);
    vec4 mv = modelViewMatrix * vec4(position * breathe, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const SHELL_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uEngage;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 3.0);
    vec3 cyan = vec3(0.0, 0.95, 1.0);
    vec3 violet = vec3(0.545, 0.36, 0.96);
    vec3 col = mix(cyan, violet, fres + 0.5 * sin(uTime * 0.7) * 0.5 + 0.25);
    col = mix(col, vec3(0.85, 0.27, 0.93), uEngage * 0.5);
    float alpha = fres * (0.42 + uEngage * 0.3);
    gl_FragColor = vec4(col * (0.8 + uEngage * 0.5), alpha);
  }
`;

const RING_VERT = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec3 random;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uEngage;
  uniform float uPixelRatio;

  varying float vFade;
  varying float vSpeed;

  void main() {
    vec3 pos = position;

    // Per-particle orbit speed (random.z holds a 0.2..1 factor).
    float speed = 0.5 + random.z * 2.0;
    float radius = length(pos.xz);
    float angle = atan(pos.z, pos.x) + uTime * 0.12 * speed + uEngage * uTime * 0.25 * speed;

    // Gentle vertical bob, per-particle phase.
    pos.y += sin(uTime * (0.6 + random.x) + pos.x * 2.0) * 0.18;

    vec3 rotated = vec3(cos(angle) * radius, pos.y, sin(angle) * radius);

    vec4 mv = modelViewMatrix * vec4(rotated, 1.0);

    // Distance fade — distant particles sink into the background.
    vFade = clamp(1.0 - (length(mv.xyz) - 2.4) / 6.5, 0.05, 1.0);
    vSpeed = speed;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.6 + random.y * 3.4) * uPixelRatio * (1.0 + uEngage * 0.5) * (3.4 / -mv.z);
  }
`;

const RING_FRAG = /* glsl */ `
  precision highp float;
  uniform float uEngage;
  varying float vFade;
  varying float vSpeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);

    vec3 cyan = vec3(0.0, 0.95, 1.0);
    vec3 violet = vec3(0.545, 0.36, 0.96);
    vec3 col = mix(cyan, violet, clamp(vSpeed * 0.45, 0.0, 1.0));
    col += uEngage * 0.35;

    gl_FragColor = vec4(col, core * vFade * (0.5 + uEngage * 0.5));
  }
`;

const GRID_VERT = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  varying vec2 vUv;
  varying vec3 vViewPos;

  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const GRID_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uEngage;
  varying vec2 vUv;
  varying vec3 vViewPos;

  float gridLine(vec2 uv, float scale, float thickness) {
    vec2 g = abs(fract(uv * scale - 0.5) - 0.5);
    return 1.0 - smoothstep(0.0, thickness, min(g.x, g.y));
  }

  void main() {
    // Perspective squash: the flat plane reads as a receding floor.
    vec2 uv = vUv;
    uv.y = uv.y * uv.y * 1.4 + uv.y * 0.2;

    float lines = gridLine(uv, 22.0, 0.05);
    float linesFine = gridLine(uv, 88.0, 0.035) * 0.35;
    float g = max(lines, linesFine);

    // Energy pulse travelling outward from the centre.
    float pulse = sin(length(uv - 0.5) * 14.0 - uTime * 1.6) * 0.5 + 0.5;
    float ring = smoothstep(0.45, 0.0, length(uv - 0.5));

    vec3 cyan = vec3(0.0, 0.95, 1.0);
    vec3 violet = vec3(0.545, 0.36, 0.96);
    vec3 col = mix(cyan, violet, ring * 0.8 + 0.1);

    float glow = g * (0.16 + 0.5 * ring * pulse + uEngage * 0.18);
    float fade = smoothstep(0.0, 0.35, uv.y) * (1.0 - smoothstep(0.75, 1.0, uv.y));
    fade *= smoothstep(0.0, 0.25, uv.x) * (1.0 - smoothstep(0.75, 1.0, uv.x));

    // Depth fade so the far edge dissolves into the page background.
    float depthFade = smoothstep(9.0, 3.5, length(vViewPos));

    float alpha = glow * fade * depthFade;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(col * glow * 1.4, alpha);
  }
`;

const DUST_VERT = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec3 random;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uPixelRatio;

  varying float vTwinkle;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * (0.15 + random.x * 0.25) + pos.z * 1.4) * 0.3;
    pos.x += cos(uTime * (0.1 + random.y * 0.2) + pos.y) * 0.3;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vTwinkle = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.8 + random.z) + random.x * 40.0));
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.4 + random.y * 2.2) * uPixelRatio * (3.2 / -mv.z);
  }
`;

const DUST_FRAG = /* glsl */ `
  precision highp float;
  varying float vTwinkle;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d) * vTwinkle * 0.55;
    gl_FragColor = vec4(vec3(0.62, 0.78, 1.0), a);
  }
`;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CoreGL({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engageRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Phones get a lower DPR cap and fewer particles (see RING_COUNT below);
    // the same loop drives both, so the mobile rig costs a fraction of the
    // desktop one while staying interactive.
    const isSmall = window.innerWidth < 640;

    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, isSmall ? 1.1 : 1.6),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive — holographic light
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    container.appendChild(gl.canvas);

    const scene = new Transform();
    const camera = new Camera(gl, { fov: 38, near: 0.1, far: 60 });
    camera.position.set(0, 0.75, 6.4);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);

    // ---------- 1. Wireframe icosphere core ----------
    const { verts, faces } = icosphere(1);
    const lineIndices: number[] = [];
    for (const f of faces) lineIndices.push(f[0], f[1], f[2]);

    const coreGeometry = new Geometry(gl, {
      position: { size: 3, data: new Float32Array(verts.flat()) },
      normal: { size: 3, data: new Float32Array(verts.flat()) },
      index: { size: 1, data: new Uint16Array(lineIndices) },
    });

    const core = new Mesh(gl, {
      geometry: coreGeometry,
      program: new Program(gl, {
        vertex: CORE_VERT,
        fragment: CORE_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uEngage: { value: 0 } },
      }),
      mode: gl.LINES,
    });
    core.position.set(0, 0.35, 0);
    core.scale.set(1.28);
    core.setParent(scene);

    // ---------- 2. Fresnel energy shell ----------
    const shellData = icosphere(3);
    const shellGeometry = new Geometry(gl, {
      position: { size: 3, data: new Float32Array(shellData.verts.flat()) },
      normal: { size: 3, data: new Float32Array(shellData.verts.flat()) },
      index: {
        size: 1,
        data: new Uint16Array(shellData.faces.flat()),
      },
    });

    const shell = new Mesh(gl, {
      geometry: shellGeometry,
      program: new Program(gl, {
        vertex: SHELL_VERT,
        fragment: SHELL_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uEngage: { value: 0 } },
      }),
    });
    shell.position.set(0, 0.35, 0);
    shell.scale.set(1.06);
    shell.setParent(scene);

    // ---------- 3. Holographic particle ring ----------
    // 2000 on desktop, 800 on phones — visually similar, far cheaper.
    const RING_COUNT = isSmall ? 800 : 2000;
    const ringPositions = new Float32Array(RING_COUNT * 3);
    const ringRandoms = new Float32Array(RING_COUNT * 3);
    for (let i = 0; i < RING_COUNT; i++) {
      const angle = Math.random() * TAU;
      const radius = 1.9 + Math.pow(Math.random(), 0.7) * 1.35;
      ringPositions[i * 3 + 0] = Math.cos(angle) * radius;
      ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      ringPositions[i * 3 + 2] = Math.sin(angle) * radius;
      ringRandoms[i * 3 + 0] = Math.random();
      ringRandoms[i * 3 + 1] = Math.random();
      ringRandoms[i * 3 + 2] = 0.2 + Math.random() * 0.8;
    }
    const ringGeometry = new Geometry(gl, {
      position: { size: 3, data: ringPositions },
      random: { size: 3, data: ringRandoms },
    });

    const ring = new Mesh(gl, {
      geometry: ringGeometry,
      program: new Program(gl, {
        vertex: RING_VERT,
        fragment: RING_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uEngage: { value: 0 },
          uPixelRatio: { value: dpr },
        },
      }),
      mode: gl.POINTS,
    });
    ring.position.set(0, 0.35, 0);
    ring.setParent(scene);

    // ---------- 4. Floor grid ----------
    const gridGeometry = new Geometry(gl, {
      position: {
        size: 3,
        data: new Float32Array([-10, 0, -10, 10, 0, -10, 10, 0, 10, -10, 0, 10]),
      },
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]) },
      index: { size: 1, data: new Uint16Array([0, 1, 2, 0, 2, 3]) },
    });

    const grid = new Mesh(gl, {
      geometry: gridGeometry,
      program: new Program(gl, {
        vertex: GRID_VERT,
        fragment: GRID_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uEngage: { value: 0 } },
      }),
    });
    grid.position.set(0, -0.85, 0);
    grid.setParent(scene);

    // ---------- 5. Star dust ----------
    const DUST_COUNT = isSmall ? 160 : 420;
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustRandoms = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      dustPositions[i * 3 + 0] = (Math.random() - 0.5) * 16;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3;
      dustRandoms[i * 3 + 0] = Math.random();
      dustRandoms[i * 3 + 1] = Math.random();
      dustRandoms[i * 3 + 2] = Math.random();
    }
    const dustGeometry = new Geometry(gl, {
      position: { size: 3, data: dustPositions },
      random: { size: 3, data: dustRandoms },
    });

    const dust = new Mesh(gl, {
      geometry: dustGeometry,
      program: new Program(gl, {
        vertex: DUST_VERT,
        fragment: DUST_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr } },
      }),
      mode: gl.POINTS,
    });
    dust.setParent(scene);

    // ---------- Interaction ----------
    const pointer = { x: 0, y: 0 };
    const pointerSmooth = { x: 0, y: 0 };
    let engage = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onPointerDown = () => {
      engageRef.current = true;
    };
    const onPointerUp = () => {
      engageRef.current = false;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });

    // ---------- Resize ----------
    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w * dpr, h * dpr);
      gl.canvas.style.width = `${w}px`;
      gl.canvas.style.height = `${h}px`;
      camera.perspective({ aspect: w / h });
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // ---------- Loop control ----------
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(container);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const target = new Vec3(0, 0.1, 0);
    let raf = 0;
    let time = 0;
    let last = performance.now();

    const update = (now: number) => {
      raf = requestAnimationFrame(update);
      if (document.hidden || !visible) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) * 0.001, 0.05);
      last = now;
      time += dt;

      // Damped pointer easing — gyroscope feel.
      pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.045;
      pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.045;
      engage += ((engageRef.current ? 1 : 0) - engage) * 0.07;

      // Idle orbit + pointer tilt.
      const idleSpin = time * 0.16;
      core.rotation.y = idleSpin + pointerSmooth.x * 0.55;
      core.rotation.x = Math.sin(time * 0.4) * 0.08 - pointerSmooth.y * 0.35;
      core.rotation.z = Math.sin(time * 0.23) * 0.06;

      // Shell drifts slightly slower for a liquid-metal parallax.
      shell.rotation.y = idleSpin * 0.82 + pointerSmooth.x * 0.4;
      shell.rotation.x = core.rotation.x * 0.8;
      shell.rotation.z = core.rotation.z * 0.8;

      ring.rotation.y = -time * 0.05 + pointerSmooth.x * 0.2;
      ring.rotation.x = Math.sin(time * 0.3) * 0.05 - pointerSmooth.y * 0.12;
      dust.rotation.y = time * 0.008;

      // Scene-level parallax against the pointer.
      scene.position.x = -pointerSmooth.x * 0.35;
      scene.position.y = pointerSmooth.y * 0.22;
      camera.position.y = 0.75 - pointerSmooth.y * 0.25;
      camera.position.z = 6.4 - engage * 0.5;
      camera.lookAt(target);

      // Uniform sync.
      core.program.uniforms.uTime.value = time;
      core.program.uniforms.uEngage.value = engage;
      shell.program.uniforms.uTime.value = time;
      shell.program.uniforms.uEngage.value = engage;
      ring.program.uniforms.uTime.value = time;
      ring.program.uniforms.uEngage.value = engage;
      grid.program.uniforms.uTime.value = time;
      grid.program.uniforms.uEngage.value = engage;
      dust.program.uniforms.uTime.value = time;

      renderer.render({ scene, camera });
    };

    if (!reduced) {
      raf = requestAnimationFrame(update);
    } else {
      // Single static frame for reduced-motion users.
      renderer.render({ scene, camera });
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={containerRef} aria-hidden className={className ?? "absolute inset-0"} />;
}

export default CoreGL;
