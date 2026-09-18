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
 *   2. Aurora                 — flowing gradient (ALL viewports, lighter on phones)
 *   3. MoltenMetal            — caustic plasma filaments, screen-blended (desktop only)
 *   4. Drifting aurora orbs   — cheap CSS light, keeps phones from going flat
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
 * Devices under 640px used to skip the WebGL layers entirely, which meant the
 * animated backdrop was invisible on phones — only the flat CSS mesh showed.
 * Now the single cheap aurora shader runs everywhere; only the second
 * (heavier, screen-blended) plasma layer stays desktop-only.
 */
function snapshot() {
  return window.innerWidth >= 640;
}

/** True when the OS asks for reduced motion — freeze everything animated. */
function subscribeMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function motionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AuroraBackdrop() {
  const isDesktop = useSyncExternalStore(subscribe, snapshot, () => false);
  const reduced = useSyncExternalStore(subscribeMotion, motionSnapshot, () => false);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-backdrop overflow-hidden">
      {/* Base wash stays even without WebGL, so the page is never flat black. */}
      <div className="absolute inset-0 mesh-deep" />
      <div className="starfield" />

      {/* The aurora is one light shader — it now runs on phones too, with
          lower amplitude/speed and a coarser DPR inside AuroraGL itself. */}
      {!reduced && (
        <AuroraGL
          colorStops={["#7cff67", "#B497CF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
          className="absolute inset-0 h-full w-full"
        />
      )}

      {/* Molten filaments on top — desktop only (two full-screen shaders on a
          phone is where the old build gave up and shipped none). `screen`
          blending makes the layers add light instead of painting over. */}
      {isDesktop && !reduced && (
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

      {/* Phones skip MoltenMetal, so two slow CSS orbs carry the RGB drift
          instead — negligible cost, keeps the field alive while scrolling. */}
      {!isDesktop && !reduced && (
        <>
          <div className="aurora aurora-cyan animate-drift-a absolute -top-32 -start-24 h-80 w-80 blur-[90px]" />
          <div className="aurora aurora-purple animate-drift-b absolute -bottom-40 -end-28 h-96 w-96 blur-[110px]" />
        </>
      )}
    </div>
  );
}
