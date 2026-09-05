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
    <section id="process" className="relative overflow-hidden section-y">
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
            className="absolute inset-x-0 top-8 hidden h-px origin-inline-start bg-gradient-to-r from-neon-cyan/50 via-neon-indigo/50 to-neon-purple/50 lg:block"
          />

          <StaggerGroup className="grid gap-4 lg:grid-cols-5">
            {t.process.steps.map((step, i) => (
              <StaggerItem key={step.title}>
                <TiltCard intensity={6} className="h-full">
                  <div className="glass-card glow-hover group relative h-full p-6 pt-9">
                    <span className="absolute -top-3 start-6 rounded-full bg-gradient-to-r from-neon-cyan to-neon-indigo px-3 py-1 font-mono text-[11px] font-black text-white shadow-glow-cyan">
                      0{i + 1}
                    </span>
                    <h3 className="text-base font-bold tracking-tight">{step.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-low">{step.desc}</p>
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
                <Quote className="h-7 w-7 text-neon-cyan/50 flip-x" />
                <blockquote className="mt-4 text-sm leading-relaxed text-ink-mid">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-line pt-4">
                  <span className="block text-xs font-bold">{item.author}</span>
                  <span className="mono-label !text-ink-low">{item.role}</span>
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
          <div className="glow-border noise relative overflow-hidden bg-gradient-to-br from-neon-cyan/[0.10] via-neon-indigo/[0.06] to-neon-purple/[0.08] p-12 text-center sm:p-20">
            <ParticleField density={40} className="opacity-60" />
            <div className="absolute inset-0 cyber-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div className="absolute -bottom-24 start-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-neon-cyan/15 blur-[120px]" />

            <h2 className="relative text-3xl sm:text-5xl">
              <span className="text-gradient-hero">{t.quote.title}</span>
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl leading-relaxed text-ink-low">
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
