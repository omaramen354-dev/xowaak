"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, TrendingUp } from "lucide-react";
import { useI18n } from "@/components/providers";
import { useContent } from "@/lib/content-store";
import { AnimatedCounter, Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";

// Real 3D canvas — client-only, code-split so it never blocks first paint.
const Hero3D = dynamic(() => import("@/components/public/hero-3d"), {
  ssr: false,
  loading: () => null,
});

export function Hero() {
  const { locale, t } = useI18n();
  const { stats } = useContent();

  return (
    <section className="relative isolate overflow-hidden noise">
      {/* Deep radial mesh — no silver, only light living inside the black */}
      <div aria-hidden className="pointer-events-none absolute inset-0 mesh-deep" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 cyber-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,black,transparent)]"
      />

      {/* 3D core, centred behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-4 mx-auto h-[600px] w-full max-w-4xl opacity-60 sm:opacity-80"
      >
        <Hero3D />
      </div>

      <div className="container-x relative section-y">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="chip border-neon-cyan/30 bg-neon-cyan/[0.06] text-neon-cyan"
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon-cyan" />
            </span>
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            {t.hero.badge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-4xl leading-[1.06] text-ink-hi sm:text-6xl lg:text-[4.4rem]"
          >
            {t.hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-low"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }}>
              <Link href={`/${locale}/quote`} className="btn-primary group">
                <span className="relative z-10">{t.hero.ctaPrimary}</span>
                <ArrowRight className="relative z-10 h-4 w-4 shrink-0 flip-x transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }}>
              <Link href="#portfolio" className="btn-ghost">
                <Play className="h-4 w-4 shrink-0" />
                {t.hero.ctaSecondary}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* CMS-driven animated counters */}
        <StaggerGroup className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StaggerItem key={stat.id}>
              <div className="glass-card glow-hover h-full p-6 text-center">
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
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-neon-emerald/10 px-2 py-0.5 text-[10px] font-bold text-neon-emerald">
                    <TrendingUp className="h-3 w-3 shrink-0 flip-x" />
                    {stat.growth > 0 ? "+" : ""}
                    {stat.growth}%
                  </span>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Delivery pipeline preview */}
        <Reveal className="mx-auto mt-16 max-w-5xl" delay={0.1}>
          <div className="glow-border bg-surface/60 p-1.5 backdrop-blur-md">
            <div className="rounded-[1.1rem] bg-base/60 p-5">
              <div className="flex items-center gap-1.5 pb-4">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-neon-emerald/70" />
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
                    className="rounded-xl border border-line bg-white/[0.03] p-3 text-start"
                  >
                    <span className="font-mono text-[10px] text-neon-cyan">0{i + 1}</span>
                    <p className="mt-1 text-xs font-semibold text-ink-mid">{step.title}</p>
                    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-line">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${100 - i * 18}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 + i * 0.09, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
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
