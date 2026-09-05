import * as THREE from "three";

/**
 * Shared neon colour cycle.
 *
 * Both WebGL scenes drive their materials through this so the whole page
 * shifts hue together instead of each layer inventing its own palette.
 * Pass a phase offset (in seconds) to keep elements out of sync.
 */
const STOPS = [
  new THREE.Color("#00F2FE"), // cyan
  new THREE.Color("#8B5CF6"), // violet
  new THREE.Color("#EC4899"), // pink
  new THREE.Color("#10B981"), // emerald
];

const SECONDS_PER_STOP = 6;

/** Write the colour for time `t` (seconds) into `target`. */
export function neonAt(t: number, target: THREE.Color): THREE.Color {
  const p = (t / SECONDS_PER_STOP) % STOPS.length;
  const i = Math.floor(p);
  const k = p - i;
  // smoothstep — the crossfade never looks mechanical
  const e = k * k * (3 - 2 * k);
  return target.copy(STOPS[i]).lerp(STOPS[(i + 1) % STOPS.length], e);
}
