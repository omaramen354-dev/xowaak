"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Mounts the global 3D field lazily on the client.
 *
 * Split out from scene-3d.tsx so the three.js bundle is never part of the
 * initial payload: it loads after first paint, and not at all for users who
 * asked for reduced motion or are on a small/low-power screen.
 */
const Scene3D = dynamic(() => import("@/components/ui/scene-3d"), { ssr: false, loading: () => null });

export function SceneMount() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Phones get the CSS aurora only — a WebGL canvas is not worth the battery.
    const small = window.matchMedia("(max-width: 767px)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    if (reduced || small || cores < 4) return;

    // Defer past first paint so the hero text is never blocked.
    const id = window.setTimeout(() => setEnabled(true), 350);
    return () => window.clearTimeout(id);
  }, []);

  if (!enabled) return null;
  return <Scene3D />;
}

export default SceneMount;
