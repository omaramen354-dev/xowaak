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
 * FIXED: Previously had 3-4 overlapping layers always rendering:
 *   mesh-deep + starfield (CSS) + AuroraGL (WebGL) + MoltenMetal (WebGL)
 *   - starfield was always on even when WebGL was active
 *   - Aurora + Molten both at full opacity with screen blend fought visually
 *   - plus hero's own cyber-grid and Orb made it 5+ layers in hero area
 *
 * Now: single coherent system:
 *   - mesh-deep always as subtle base wash (never flat black)
 *   - WebGL enabled (>=640px): AuroraGL only (single canvas, low cost)
 *   - WebGL disabled (phones): starfield only as lightweight fallback
 *   MoltenMetal removed from global backdrop to avoid second GL context
 *   conflicting with Aurora. If needed, it can be used locally in a section.
 *
 * `fixed inset-0` + `z-backdrop` (0) keeps it under all content, which is
 * lifted to `z-content`. `pointer-events-none` means it never eats clicks.
 */
const AuroraGL = dynamic(() => import("@/components/ui/aurora-gl").then((m) => m.AuroraGL), {
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
      {/* Base wash — subtle radial mesh, always present so page is never flat black */}
      <div className="absolute inset-0 mesh-deep opacity-80" />

      {enabled ? (
        <AuroraGL
          colorStops={["#7cff67", "#B497CF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <div className="starfield" />
      )}
    </div>
  );
}
