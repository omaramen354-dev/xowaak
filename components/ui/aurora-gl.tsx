"use client";

import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useEffect, useRef } from "react";

/**
 * Aurora — react-bits (@react-bits/Aurora-JS-CSS), ported to TypeScript.
 *
 * A single full-viewport WebGL gradient rendered from a simplex-noise shader.
 * This replaces the old per-section CSS `<Aurora />`, which had to be dropped
 * into six components separately and restarted at every section boundary.
 * Here it is mounted ONCE in the locale layout as a fixed backdrop, so the
 * flow is continuous across the whole page and while scrolling.
 *
 * Kept from the original: the shader (VERT/FRAG) verbatim.
 * Changed for this codebase:
 *  - typed props instead of loose JS
 *  - the upstream file ends in `return ;` (an empty return, i.e. it renders
 *    nothing) — restored to an actual container div
 *  - DPR clamped, and the loop paused when the tab is hidden or the document
 *    is not visible, so a background tab does not keep burning GPU
 *  - honours prefers-reduced-motion by freezing the animation
 */

export type AuroraProps = {
  colorStops?: [string, string, string];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
};

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \\
  int index = 0;                                            \\
  for (int i = 0; i < 2; i++) {                               \\
     ColorStop currentColor = colors[i];                    \\
     bool isInBetween = currentColor.position <= factor;    \\
     index = int(mix(float(index), float(i), float(isInBetween))); \\
  }                                                         \\
  ColorStop currentColor = colors[index];                   \\
  ColorStop nextColor = colors[index + 1];                  \\
  float range = nextColor.position - currentColor.position; \\
  float lerpFactor = (factor - currentColor.position) / range; \\
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \\
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

export function AuroraGL({
  // AWWA neon palette rather than the react-bits purple/green default.
  colorStops = ["#00F2FE", "#8B5CF6", "#EC4899"],
  amplitude = 1.0,
  blend = 0.5,
  speed = 1.0,
  className,
}: AuroraProps) {
  const ctnDom = useRef<HTMLDivElement>(null);

  // Live props for the render loop, so changing them never restarts WebGL.
  // Upstream assigns this during render; that is a ref write in the render
  // phase, which React's compiler flags and which is unsafe under concurrent
  // rendering. Syncing in an effect is equivalent here because only the
  // rAF loop reads it, and that starts after mount.
  const propsRef = useRef({ amplitude, blend, speed, colorStops });
  useEffect(() => {
    propsRef.current = { amplitude, blend, speed, colorStops };
  }, [amplitude, blend, speed, colorStops]);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      // Clamped: the aurora is a soft blur, so full DPR on a 3x phone screen
      // costs a lot of fill rate and buys nothing visible.
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";

    const geometry = new Triangle(gl);
    // The shader has no `uv` attribute; leaving it bound wastes a slot.
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const toRGB = (stops: string[]) =>
      stops.map((hex) => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: toRGB(colorStops) },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    function resize() {
      if (!ctn) return;
      const w = ctn.offsetWidth;
      const h = ctn.offsetHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w, h];
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    let animateId = 0;
    let lastStops = colorStops.join();
    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      // Skip GPU work entirely while the tab is in the background.
      if (document.hidden) return;

      const p = propsRef.current;
      // Reduced motion: hold a single frozen frame instead of animating.
      program.uniforms.uTime.value = reduced ? 0 : t * 0.01 * (p.speed ?? 1) * 0.1;
      program.uniforms.uAmplitude.value = p.amplitude ?? 1.0;
      program.uniforms.uBlend.value = p.blend ?? blend;

      // Only rebuild the colour array when the stops actually change —
      // allocating three Color objects every frame was pure garbage churn.
      const joined = (p.colorStops ?? colorStops).join();
      if (joined !== lastStops) {
        program.uniforms.uColorStops.value = toRGB(p.colorStops ?? colorStops);
        lastStops = joined;
      }

      renderer.render({ scene: mesh });
    };
    animateId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);
      if (gl.canvas.parentNode === ctn) ctn.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // Mount once: live values are read through propsRef inside the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ctnDom} aria-hidden className={className} />;
}

export default AuroraGL;
