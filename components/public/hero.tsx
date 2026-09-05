"use client";

import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useI18n } from "@/components/providers";

export function Hero() {
  const { locale, t } = useI18n();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-32 start-1/4 h-[420px] w-[420px] rounded-full bg-brand-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute top-24 end-0 h-[380px] w-[380px] rounded-full bg-fuchsia-600/20 blur-[130px]" />

      <div className="container-x relative pb-24 pt-20 sm:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="chip animate-fade-up border-brand-500/40 text-brand-500 dark:border-brand-400/30 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            {t.hero.badge}
          </span>

          <h1 className="mt-7 animate-fade-up text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient">{t.hero.title}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {t.hero.subtitle}
          </p>

          <div className="mt-9 flex animate-fade-up flex-wrap items-center justify-center gap-3">
            <Link href={`/${locale}/quote`} className="btn-primary">
              {t.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4 flip-x" />
            </Link>
            <Link href="#portfolio" className="btn-ghost">
              <Play className="h-4 w-4" />
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {t.hero.stats.map((s) => (
            <div key={s.label} className="surface animate-fade-up p-5 text-center">
              <dt className="text-3xl font-black text-gradient">{s.value}</dt>
              <dd className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">{s.label}</dd>
            </div>
          ))}
        </dl>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="glow-border animate-float bg-gradient-to-br from-brand-500/10 via-transparent to-fuchsia-500/10 p-1">
            <div className="rounded-xl bg-white/70 p-4 dark:bg-ink-800/80">
              <div className="flex items-center gap-1.5 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ms-3 text-[11px] font-mono text-slate-400">awwa://delivery-pipeline</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-5">
                {t.process.steps.map((step, i) => (
                  <div
                    key={step.title}
                    className="rounded-lg border border-slate-200 bg-white p-3 text-start dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <span className="text-[10px] font-mono text-brand-500">0{i + 1}</span>
                    <p className="mt-1 text-xs font-semibold">{step.title}</p>
                    <div className="mt-2 h-1 rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500"
                        style={{ width: `${100 - i * 18}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
