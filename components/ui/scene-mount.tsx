"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

/**
 * Gates the global 3D field behind a capability check.
 *
 * Uses useSyncExternalStore rather than a one-shot useEffect so the decision
 * REACTS to changes: rotate a tablet or toggle "reduce motion" and the scene
 * appears or disappears accordingly, instead of being frozen at first paint.
 * (This pattern came from the uploaded design pass — it is a genuine
 * improvement over the previous effect-based version.)
 */
const Scene3D = dynamic(() => import("@/components/ui/scene-3d"), { ssr: false, loading: () => null });

function subscribe(callback: () => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  window.addEventListener("resize", callback, { passive: true });
  motion.addEventListener("change", callback);
  return () => {
    window.removeEventListener("resize", callback);
    motion.removeEventListener("change", callback);
  };
}

function snapshot() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  // Phones keep the CSS aurora only — a WebGL canvas is not worth the battery.
  return !reduced && window.innerWidth >= 768 && cores >= 4;
}

export function SceneMount() {
  // Server snapshot is `false`, so nothing renders until the client decides.
  const enabled = useSyncExternalStore(subscribe, snapshot, () => false);
  if (!enabled) return null;
  return <Scene3D />;
}

export default SceneMount;
