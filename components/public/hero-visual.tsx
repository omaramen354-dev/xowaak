"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * HeroVisual — the hero centrepiece WITHOUT WebGL.
 *
 * Replaces the old ogl-based rig (hero-core-gl + aurora-gl + molten-metal)
 * that ran three full-screen shader loops and made the site laggy on phones.
 * Everything here is GPU-composited CSS (transform/opacity/box-shadow only)
 * so it animates on the compositor thread and never blocks the main thread.
 *
 * Layers, cheapest first:
 *   1. pulsing glow halo            — one animated box-shadow-ish glow
 *   2. css-energy-core              — morphing orb (existing utility, now primary)
 *   3. three tilted orbit rings     — pure rotate, staggered speeds
 *   4. four orbiting energy sparks  — counter-rotating wrappers, transform-only
 *   5. scroll parallax + spin       — framer-motion mapping scrollYProgress
 *
 * Honours prefers-reduced-motion by freezing the parallax.
 */
export function HeroVisual() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 1, 0.55]);

  return (
    <motion.div
      ref={sectionRef}
      aria-hidden
      style={reduce ? undefined : { y, rotate, opacity }}
      className="pointer-events-none relative mx-auto h-[min(78vw,420px)] w-[min(78vw,420px)] select-none"
    >
      {/* ---------- Pulsing halo behind the orb ---------- */}
      <div className="hero-glow absolute inset-[8%]" />

      {/* ---------- The morphing energy core ---------- */}
      <div className="css-energy-core" />

      {/* ---------- Tilted orbit rings ---------- */}
      <span className="hero-ring hero-ring-a" />
      <span className="hero-ring hero-ring-b" />
      <span className="hero-ring hero-ring-c" />

      {/* ---------- Orbiting energy sparks (counter-rotating wrappers) ---------- */}
      <span className="hero-spark hero-spark-1" />
      <span className="hero-spark hero-spark-2" />
      <span className="hero-spark hero-spark-3" />
      <span className="hero-spark hero-spark-4" />
    </motion.div>
  );
}
