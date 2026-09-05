"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, TrendingUp } from "lucide-react";
import { useI18n } from "@/components/providers";
import { useContent } from "@/lib/content-store";
import { AnimatedCounter, Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { Aurora } from "@/components/ui/aurora";
import { HeroConsole } from "@/components/public/hero-console";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

// Heavy WebGL centrepiece — client-only and code-split so it never blocks
// first paint of the copy column.
const HeroOrb = dynamic(() => import("@/components/public/hero-orb"), {
  ssr: false,
  // CSS stand-in so the column is never an empty hole while three.js loads.
  loading: () => (
    <div className="relative aspect-square w-full">
      <div className="css-energy-core" aria-hidden />
    </div>
  ),
});

/**
 * Hero — strict two-column architecture.
 *
 * Layer contract (see AGENTS.md):
 *   z-backdrop (0)  ambient light + cyber grid, pointer-events-none
 *   z-stage    (20) the console, scoped to its OWN grid cell
 *   z-copy     (30) all text, badge and CTAs
 *
 * The console can never overlap the copy because they live in separate grid
 * tracks — this is structural, not a tuned offset.
 */
export function Hero() {
  const { locale, t } = useI18n();
  const { stats } = useContent();

  return (
    <section className="relative isolate overflow-hidden noise">
      {/* ---------- LAYER 0 — ambient depth only ---------- */}
      <Aurora />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-backdrop cyber-grid opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
      />

      <div className="container-x relative section-y">
        {/* Copy sits in track 1, console in track 2. On RTL the grid flows
            right-to-left automatically, putting the copy on the right. */}
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-12">
          {/* ================= COPY COLUMN — z-copy (30) ================= */}
          <div className="relative z-copy flex flex-col items-center text-center lg:items-start lg:text-start">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="neon-border inline-flex items-center gap-2 rounded-full border border-neon-cyan/35 bg-neon-cyan/[0.08]
                         px-3.5 py-1.5 text-xs font-semibold tracking-tight text-neon-cyan backdrop-blur-md"
            >
              <span className="live-dot bg-neon-cyan shadow-glow-cyan" />
              <Sparkles className="h-3.5 w-3.5 shrink-0 animate-icon-pulse" />
              {t.hero.badge}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 text-4xl font-black leading-[1.08] text-white sm:text-5xl lg:text-6xl xl:text-[4.25rem]"
            >
              {t.hero.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-ink-mid sm:text-lg"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }}>
                <Button asChild variant="neon" className="group">
<Link href={`/${locale}/quote`}>
                  <span className="relative z-10">{t.hero.ctaPrimary}</span>
                  <ArrowRight className="relative z-10 h-4 w-4 shrink-0 flip-x transition-transform group-hover:translate-x-0.5" />
                </Link>
</Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }}>
                <Button asChild variant="ghostNeon" className="group">
<Link href="#portfolio">
                  <Play className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                  {t.hero.ctaSecondary}
                </Link>
</Button>
              </motion.div>
            </motion.div>
          </div>

          {/* ============ VISUAL COLUMN — z-stage (20), isolated ============ */}
          {/* Both the 3D orb and the console live here, so neither can ever
              cross into the copy track. */}
          <div className="relative isolate order-first w-full lg:order-none">
            <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
              <HeroOrb />
              {/* Console overlaps the lower third of the orb for depth. */}
              <div className="relative -mt-16 sm:-mt-20">
                <HeroConsole />
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Animated counters ---------- */}
        <StaggerGroup className="relative z-copy mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StaggerItem key={stat.id}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-card neon-border h-full p-6 text-center"
              >
                <p className="text-4xl font-extrabold">
                  <AnimatedCounter
                    value={stat.value}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={1700 + i * 110}
                    className="text-gradient"
                  />
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-ink-low">
                  {t.hero.stats[i]?.label ?? stat.label}
                </p>
                {stat.growth !== 0 && (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-neon-emerald/12 px-2 py-0.5 text-[10px] font-bold text-neon-emerald">
                    <TrendingUp className="h-3 w-3 shrink-0 flip-x animate-float-y" />
                    {stat.growth > 0 ? "+" : ""}
                    {stat.growth}%
                  </span>
                )}
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* ---------- Delivery pipeline ---------- */}
        <Reveal className="relative z-copy mt-16" delay={0.1}>
          <div className="glow-border neon-border bg-surface/70 p-1.5 backdrop-blur-md">
            <div className="rounded-[1.1rem] bg-base/70 p-5">
              <div className="flex items-center gap-1.5 pb-4">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-neon-emerald/80" />
                <span className="ms-3 font-mono text-[11px] text-ink-faint" dir="ltr">
                  awwa://delivery-pipeline — live
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-5">
                {t.process.steps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.07 * i, duration: 0.45 }}
                    className="rounded-xl border border-line bg-white/[0.03] p-3 text-start transition-colors hover:border-neon-cyan/40"
                  >
                    <span className="font-mono text-[10px] text-neon-cyan">0{i + 1}</span>
                    <p className="mt-1 text-xs font-semibold text-ink-mid">{step.title}</p>
                    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-line">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${100 - i * 18}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 + i * 0.09, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
