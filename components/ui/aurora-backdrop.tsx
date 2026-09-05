"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

/**
 * Full-page aurora backdrop.
 *
 * Mounted ONCE in app/[locale]/layout.tsx as a fixed, viewport-sized layer, so
 * a single continuous gradient sits behind every page and does not restart at
 * section boundaries or scroll away.
 *
 * `fixed inset-0` + `z-backdrop` (0) keeps it under all content, which is
 * already lifted to `z-content`. `pointer-events-none` means it never
 * intercepts clicks.
 */
const AuroraGL = dynamic(() => import("@/components/ui/aurora-gl").then((m) => m.AuroraGL), {
  ssr: false,
  loading: () => null,
});

const MoltenMetal = dynamic(() => import("@/components/ui/molten-metal").then((m) => m.MoltenMetal), {
  ssr: false,
  loading: () => null,
});

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback, { passive: true });
  return () => window.removeEventListener("resize", callback);
}

/**
 * Very small screens skip the WebGL context entirely — the CSS mesh/starfield
 * underneath already carries the look, and a second GL context next to the
 * 3D scene is not worth the battery on a phone.
 */
function snapshot() {
  return window.innerWidth >= 640;
}

export function AuroraBackdrop() {
  const enabled = useSyncExternalStore(subscribe, snapshot, () => false);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-backdrop overflow-hidden">
      {/* Base wash stays even without WebGL, so the page is never flat black. */}
      <div className="absolute inset-0 mesh-deep" />
      <div className="starfield" />
      {enabled && <AuroraGL
          colorStops={["#7cff67", "#B497CF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
          className="absolute inset-0 h-full w-full opacity-70"
        />}
    </div>
  );
}
