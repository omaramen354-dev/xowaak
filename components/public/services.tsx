"use client";

import { Blocks, BrainCircuit, Cloud, Palette, ShieldCheck, Smartphone } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";

const icons = [Blocks, Smartphone, BrainCircuit, Cloud, Palette, ShieldCheck];

export function Services() {
  const { t } = useI18n();

  return (
    <section id="services" className="relative py-24">
      <div className="container-x">
        <SectionHeading eyebrow="01" title={t.services.title} subtitle={t.services.subtitle} />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {t.services.items.map((service, i) => {
            const Icon = icons[i % icons.length];
            return (
              <article
                key={service.title}
                className="surface group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:border-brand-500/50"
              >
                <div className="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full bg-brand-500/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-fuchsia-500/20 text-brand-500">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{service.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
