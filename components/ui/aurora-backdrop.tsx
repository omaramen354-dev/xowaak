"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

/**
 * Full-page animated backdrop.
 *
 * Mounted ONCE in app/[locale]/layout.tsx as a fixed, viewport-sized layer, so
 * one continuous field sits behind every page instead of restarting at each
 * section boundary.
 *
 * Stack, bottom to top:
 *   1. mesh-deep + starfield  — CSS, always present, the no-WebGL fallback
 *   2. Aurora                 — flowing gradient
 *   3. MoltenMetal            — caustic plasma filaments, screen-blended
 *
 * `fixed inset-0` + `z-backdrop` (0) keeps it under all content, which is
 * lifted to `z-content`. `pointer-events-none` means it never eats clicks.
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
 * Very small screens skip the WebGL layers entirely — the CSS mesh and
 * starfield already carry the look, and two GL contexts are not worth the
 * battery on a phone.
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

      {enabled && (
        <AuroraGL
          colorStops={["#7cff67", "#B497CF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
          className="absolute inset-0 h-full w-full opacity-70"
        />
      )}

      {/* Molten filaments on top. `screen` blending makes the two layers add
          light, so the aurora stays visible underneath instead of being
          painted over. */}
      {enabled && (
        <div className="absolute inset-0 mix-blend-screen">
          <MoltenMetal
            color1="#5227FF"
            color2="#FF9FFC"
            color3="#FFFFFF"
            speed={0.35}
            scale={4}
            detail={3}
            glow={1.6}
            coreSize={0.1}
            swirl={1}
            fold={-0.2}
            blackPoint={0.05}
            brightness={1.3}
            colorMode="molten"
            grain
            grainIntensity={0.05}
            mouseInteraction
            mouseStrength={0.3}
            opacity={1.0}
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  );
}
