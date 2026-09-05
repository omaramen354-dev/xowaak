"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => <div className="css-energy-core" aria-hidden="true" />,
});

function subscribeToCapabilities(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  window.addEventListener("resize", callback, { passive: true });
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("resize", callback);
    media.removeEventListener("change", callback);
  };
}

function getCapabilitySnapshot() {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hardware = navigator.hardwareConcurrency ?? 4;
  return !media.matches && window.innerWidth >= 760 && hardware >= 4;
}

export function SceneMount() {
  const enabled = useSyncExternalStore(subscribeToCapabilities, getCapabilitySnapshot, () => false);
  return enabled ? <HeroScene /> : <div className="css-energy-core" aria-hidden="true" />;
}
