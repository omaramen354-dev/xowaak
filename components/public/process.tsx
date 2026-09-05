"use client";

import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";
import { testimonials } from "@/lib/mock-data";

export function Process() {
  const { t } = useI18n();

  return (
    <section id="process" className="py-24">
      <div className="container-x">
        <SectionHeading eyebrow="03" title={t.process.title} subtitle={t.process.subtitle} />

        <ol className="mt-14 grid gap-4 lg:grid-cols-5">
          {t.process.steps.map((step, i) => (
            <li key={step.title} className="surface relative p-6">
              <span className="absolute -top-3 start-6 rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 px-3 py-1 text-[11px] font-black text-white">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-base font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.author} className="surface p-6">
              <Quote className="h-6 w-6 text-brand-500/60 flip-x" />
              <blockquote className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {item.quote}
              </blockquote>
              <figcaption className="mt-4 text-xs font-semibold text-slate-500">
                {item.author} · {item.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CallToAction() {
  const { locale, t } = useI18n();

  return (
    <section className="pb-24">
      <div className="container-x">
        <div className="glow-border relative overflow-hidden bg-gradient-to-br from-brand-600/20 via-transparent to-fuchsia-600/20 p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
          <h2 className="relative text-3xl font-black tracking-tight sm:text-4xl">{t.quote.title}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-400">{t.quote.subtitle}</p>
          <div className="relative mt-8 flex justify-center">
            <Link href={`/${locale}/quote`} className="btn-primary">
              {t.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4 flip-x" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
