"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, TrendingUp } from "lucide-react";
import { useI18n } from "@/components/providers";
import { useContent } from "@/lib/content-store";
import { AnimatedCounter, Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { MeshBackdrop, ParticleField } from "@/components/ui/backgrounds";

// The 3D canvas is client-only and code-split so it never blocks first paint.
const Hero3D = dynamic(() => import("@/components/public/hero-3d").then((m) => m.Hero3D), {
  ssr: false,
});

export function Hero() {
  const { locale, t } = useI18n();
  const { stats } = useContent();

  return (
    <section className="relative isolate overflow-hidden noise">
      <MeshBackdrop />
      <ParticleField className="opacity-70" density={70} />

      {/* 3D core sits behind the headline, clipped to the hero */}
      <div className="pointer-events-none absolute inset-x-0 top-10 h-[560px] opacity-70 sm:opacity-90">
        <Hero3D />
      </div>

      <div className="container-x relative pb-24 pt-24 sm:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="chip border-cyan-400/30 bg-cyan-400/5 text-cyan-300 shadow-[0_0_30px_-10px_rgba(34,211,238,0.6)]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            <Sparkles className="h-3.5 w-3.5" />
            {t.hero.badge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-4xl font-black leading-[1.05] sm:text-6xl lg:text-[4.6rem]"
          >
            <span className="text-gradient-hero drop-shadow-[0_0_40px_rgba(34,211,238,0.25)]">{t.hero.title}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.38 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link href={`/${locale}/quote`} className="btn-primary group">
              {t.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4 flip-x transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="#portfolio" className="btn-ghost">
              <Play className="h-4 w-4" />
              {t.hero.ctaSecondary}
            </Link>
          </motion.div>
        </div>

        {/* CMS-driven animated stat counters */}
        <StaggerGroup className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StaggerItem key={stat.id}>
              <div className="glass-card glow-ring group h-full p-6 text-center">
                <p className="text-4xl font-black">
                  <AnimatedCounter
                    value={stat.value}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={1600 + i * 120}
                    className="text-gradient"
                  />
                </p>
                <p className="mono-label mt-3 !text-slate-500">
                  {t.hero.stats[i]?.label ?? stat.label}
                </p>
                {stat.growth !== 0 && (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {stat.growth > 0 ? "+" : ""}
                    {stat.growth}%
                  </span>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Delivery pipeline preview */}
        <Reveal className="relative mx-auto mt-16 max-w-5xl" delay={0.15}>
          <div className="glow-border glass-card bg-gradient-to-br from-cyan-500/[0.07] via-transparent to-violet-500/[0.07] p-1.5">
            <div className="rounded-[1.15rem] bg-white/60 p-5 backdrop-blur-xl dark:bg-ink-900/70">
              <div className="flex items-center gap-1.5 pb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ms-3 font-mono text-[11px] text-cyan-400/70">awwa://delivery-pipeline —— live</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-5">
                {t.process.steps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 * i, duration: 0.5 }}
                    className="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-start dark:border-white/[0.07] dark:bg-white/[0.03]"
                  >
                    <span className="font-mono text-[10px] text-cyan-400">0{i + 1}</span>
                    <p className="mt-1 text-xs font-semibold">{step.title}</p>
                    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${100 - i * 18}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
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
