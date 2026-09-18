"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore, useEffect, useRef, useState } from "react";

/**
 * HeroCore — the interactive centrepiece of the hero.
 *
 * A pointer-reactive 3D rig rendered with ogl (already a dependency), kept in
 * a separate client-only module (hero-core-gl.tsx) so three.js-level code is
 * never in the first-paint bundle. A crafted CSS/Canvas fallback renders
 * until the GL module streams in, and permanently on devices where WebGL is
 * genuinely unavailable (no context, reduced-motion).
 *
 * Phones used to be hard-excluded (innerWidth < 640) which is why mobile saw
 * a single flat backdrop while desktop got three layers. The rig now runs on
 * phones too — hero-core-gl adapts particle counts and DPR by viewport, and
 * the CSS core still renders underneath during the load crossfade.
 */

const CoreGL = dynamic(() => import("./hero-core-gl").then((m) => m.CoreGL), {
  ssr: false,
  loading: () => null,
});

/** WebGL availability probe — cached module-level so we evaluate once. */
let glSupported: boolean | null = null;
function supportsWebGL(): boolean {
  if (glSupported !== null) return glSupported;
  try {
    const canvas = document.createElement("canvas");
    glSupported = Boolean(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl"),
    );
  } catch {
    glSupported = false;
  }
  return glSupported;
}

/**
 * Device capability flags read through useSyncExternalStore so the React
 * Compiler's set-state-in-effect rule stays satisfied. All three snapshots
 * are cheap and cached module-level where they can be.
 */
function subscribeNoop(callback: () => void) {
  // These device traits do not change mid-session in any way we care about;
  // the listener exists only to satisfy the subscription contract.
  window.addEventListener("resize", callback, { passive: true });
  return () => window.removeEventListener("resize", callback);
}

function glSnapshot() {
  return supportsWebGL();
}

function reducedSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroCore() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glOk = useSyncExternalStore(subscribeNoop, glSnapshot, () => false);
  const reduced = useSyncExternalStore(subscribeNoop, reducedSnapshot, () => false);
  const [dissolve, setDissolve] = useState(false);

  const mode: "pending" | "gl" | "fallback" =
    glOk && !reduced ? "gl" : "fallback";

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      {/* ---------- CSS/canvas fallback (also the loader) ---------- */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: dissolve ? 0 : 1 }}
      >
        <div className="css-energy-core" />
        <div className="starfield" />
        {/* Ticker — the fallback gets the same HUD readout, frozen. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <div className="mono-label flex items-center gap-2 !text-ink-faint">
            <span className="live-dot bg-neon-cyan" />
            AAKWHX.SYS — ONLINE
          </div>
        </div>
      </div>

      {/* ---------- Interactive WebGL rig ---------- */}
      {mode === "gl" && <CoreGL />}
    </div>
  );
}
