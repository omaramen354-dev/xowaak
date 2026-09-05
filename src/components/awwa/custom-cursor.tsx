"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeToEnvironment(callback: () => void) {
  const fine = window.matchMedia("(pointer: fine)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  fine.addEventListener("change", callback);
  reduce.addEventListener("change", callback);
  return () => {
    fine.removeEventListener("change", callback);
    reduce.removeEventListener("change", callback);
  };
}

function readEnvironment() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function CustomCursor() {
  const enabled = useSyncExternalStore(subscribeToEnvironment, readEnvironment, () => false);
  const [hot, setHot] = useState(false);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 260, damping: 24, mass: 0.5 });
  const ringY = useSpring(dotY, { stiffness: 260, damping: 24, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return undefined;

    const move = (event: PointerEvent) => {
      dotX.set(event.clientX);
      dotY.set(event.clientY);
    };
    const over = (event: PointerEvent) => {
      const target = (event.target as HTMLElement).closest(
        "a, button, .option, input, textarea, .project-tab, .service-row-head, [data-cursor]",
      );
      setHot(Boolean(target));
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [enabled, dotX, dotY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div className="cursor-dot" style={{ x: dotX, y: dotY }} aria-hidden="true" />
      <motion.div
        className={hot ? "cursor-ring hot" : "cursor-ring"}
        style={{ x: ringX, y: ringY }}
        aria-hidden="true"
      />
    </>
  );
}
