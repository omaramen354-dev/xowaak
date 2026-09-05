"use client";

import clsx from "clsx";
import { Blocks, BrainCircuit, Cloud, Palette, ShieldCheck, Smartphone } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal, StaggerGroup, StaggerItem, TiltCard } from "@/components/ui/motion";
import { Spotlight } from "@/components/ui/motion";

const icons = [Blocks, Smartphone, BrainCircuit, Cloud, Palette, ShieldCheck];

/** Bento layout: first and fourth tiles span wider for editorial rhythm. */
const spans = [
  "lg:col-span-2 lg:row-span-1",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-2",
];

const accents = [
  "from-cyan-500/20 to-blue-500/5 text-cyan-400",
  "from-violet-500/20 to-fuchsia-500/5 text-violet-400",
  "from-emerald-500/20 to-teal-500/5 text-emerald-400",
  "from-blue-500/20 to-indigo-500/5 text-blue-400",
  "from-fuchsia-500/20 to-pink-500/5 text-fuchsia-400",
  "from-amber-500/20 to-orange-500/5 text-amber-400",
];

export function Services() {
  const { t } = useI18n();

  return (
    <section id="services" className="relative overflow-hidden py-28">
      <Spotlight />
      <div className="container-x relative">
        <Reveal>
          <SectionHeading eyebrow="01 / CAPABILITIES" title={t.services.title} subtitle={t.services.subtitle} />
        </Reveal>

        <StaggerGroup className="mt-16 grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
          {t.services.items.map((service, i) => {
            const Icon = icons[i % icons.length];
            return (
              <StaggerItem key={service.title} className={spans[i % spans.length]}>
                <TiltCard intensity={7} className="h-full">
                  <article className="glass-card glow-ring group relative h-full overflow-hidden p-7">
                    <div
                      className={clsx(
                        "pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
                        accents[i % accents.length],
                      )}
                    />
                    <span
                      className={clsx(
                        "relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/10",
                        accents[i % accents.length],
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                    <h3 className="relative mt-6 text-lg font-bold tracking-tight">{service.title}</h3>
                    <p className="relative mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {service.desc}
                    </p>

                    <div className="relative mt-5 flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span key={tag} className="chip font-mono !text-[10px] !tracking-tight">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="mono-label absolute bottom-5 end-6 opacity-40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </article>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
