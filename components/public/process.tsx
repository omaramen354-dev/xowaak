"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal, StaggerGroup, StaggerItem, TiltCard } from "@/components/ui/motion";
import { ParticleField } from "@/components/ui/backgrounds";
import { testimonials } from "@/lib/mock-data";

export function Process() {
  const { t } = useI18n();

  return (
    <section id="process" className="relative overflow-hidden py-28">
      <div className="container-x relative">
        <Reveal>
          <SectionHeading eyebrow="03 / METHODOLOGY" title={t.process.title} subtitle={t.process.subtitle} />
        </Reveal>

        <div className="relative mt-16">
          {/* Connecting beam behind the stage cards */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-8 hidden h-px origin-start bg-gradient-to-r from-cyan-400/60 via-violet-500/60 to-emerald-400/60 lg:block"
          />

          <StaggerGroup className="grid gap-4 lg:grid-cols-5">
            {t.process.steps.map((step, i) => (
              <StaggerItem key={step.title}>
                <TiltCard intensity={6} className="h-full">
                  <div className="glass-card glow-ring group relative h-full p-6 pt-9">
                    <span className="absolute -top-3 start-6 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-1 font-mono text-[11px] font-black text-white shadow-[0_0_20px_-4px_rgba(34,211,238,0.9)]">
                      0{i + 1}
                    </span>
                    <h3 className="text-base font-bold tracking-tight">{step.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>

        <StaggerGroup className="mt-20 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <StaggerItem key={item.author}>
              <figure className="glass-card h-full p-7">
                <Quote className="h-7 w-7 text-cyan-400/50 flip-x" />
                <blockquote className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-slate-200/70 pt-4 dark:border-white/[0.07]">
                  <span className="block text-xs font-bold">{item.author}</span>
                  <span className="mono-label !text-slate-500">{item.role}</span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

export function CallToAction() {
  const { locale, t } = useI18n();

  return (
    <section className="pb-28">
      <div className="container-x">
        <Reveal>
          <div className="glow-border noise relative overflow-hidden bg-gradient-to-br from-cyan-500/[0.12] via-violet-500/[0.06] to-emerald-500/[0.1] p-12 text-center sm:p-20">
            <ParticleField density={40} className="opacity-60" />
            <div className="absolute inset-0 cyber-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div className="absolute -bottom-24 start-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />

            <h2 className="relative text-3xl font-black tracking-tight sm:text-5xl">
              <span className="text-gradient-hero">{t.quote.title}</span>
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl leading-relaxed text-slate-600 dark:text-slate-400">
              {t.quote.subtitle}
            </p>
            <div className="relative mt-9 flex justify-center">
              <Link href={`/${locale}/quote`} className="btn-primary group !px-7 !py-3.5 !text-base">
                {t.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4 flip-x transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
