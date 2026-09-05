"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Lock, Unlock, X } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading, ProgressBar, StatusBadge } from "@/components/ui/primitives";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { useContent, type ShowcaseProject } from "@/lib/content-store";
import type { Visibility } from "@/lib/supabase/types";

export function Portfolio() {
  const { t } = useI18n();
  const { showcase } = useContent();
  const [industry, setIndustry] = useState<string>("all");
  const [visibility, setVisibility] = useState<Visibility | "all">("all");
  const [active, setActive] = useState<ShowcaseProject | null>(null);

  const industries = useMemo(() => Array.from(new Set(showcase.map((p) => p.industry))), [showcase]);

  const filtered = useMemo(
    () =>
      showcase.filter(
        (p) => (industry === "all" || p.industry === industry) && (visibility === "all" || p.visibility === visibility),
      ),
    [showcase, industry, visibility],
  );

  return (
    <section id="portfolio" className="relative overflow-hidden py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="pointer-events-none absolute start-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[160px]" />

      <div className="container-x relative">
        <Reveal>
          <SectionHeading eyebrow="02 / SELECTED WORK" title={t.portfolio.title} subtitle={t.portfolio.subtitle} />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <FilterPill active={industry === "all"} onClick={() => setIndustry("all")}>
              {t.common.all}
            </FilterPill>
            {industries.map((ind) => (
              <FilterPill key={ind} active={industry === ind} onClick={() => setIndustry(ind)}>
                {ind}
              </FilterPill>
            ))}
            <span className="mx-2 hidden h-5 w-px bg-slate-300 sm:block dark:bg-white/10" />
            <FilterPill
              active={visibility === "public"}
              onClick={() => setVisibility(visibility === "public" ? "all" : "public")}
            >
              <Unlock className="h-3 w-3" /> {t.common.public}
            </FilterPill>
            <FilterPill
              active={visibility === "private"}
              onClick={() => setVisibility(visibility === "private" ? "all" : "private")}
            >
              <Lock className="h-3 w-3" /> {t.common.private}
            </FilterPill>
          </div>
        </Reveal>

        <motion.div layout className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={clsx(project.featured && "lg:col-span-1")}
              >
                <TiltCard intensity={8} className="h-full">
                  <button
                    type="button"
                    onClick={() => setActive(project)}
                    className="glass-card glow-ring group h-full w-full overflow-hidden text-start"
                  >
                    <div className={clsx("relative h-44 overflow-hidden bg-gradient-to-br", project.cover)}>
                      <div className="absolute inset-0 cyber-grid opacity-40" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                      <span className="absolute inset-0 grid place-items-center text-6xl text-white/25 transition-transform duration-700 group-hover:scale-125 group-hover:text-white/40">
                        {project.icon}
                      </span>

                      <span className="absolute top-3 end-3">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                            project.visibility === "private"
                              ? "border-rose-400/40 bg-rose-500/20 text-rose-200"
                              : "border-emerald-400/40 bg-emerald-500/20 text-emerald-100",
                          )}
                        >
                          {project.visibility === "private" ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          {project.visibility === "private" ? t.common.private : t.common.public}
                        </span>
                      </span>

                      <span className="mono-label absolute bottom-3 start-4 !text-white/70">{project.industry}</span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold leading-snug tracking-tight">{project.name}</h3>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {project.summary}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.tech.slice(0, 3).map((tech) => (
                          <span key={tech} className="chip font-mono !px-2 !py-0.5 !text-[10px]">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <ProgressBar value={project.progress} className="!h-1" />
                        <span className="tabular text-xs font-bold text-cyan-400">{project.progress}%</span>
                      </div>
                    </div>
                  </button>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-sm text-slate-500">{t.common.empty}</p>
        )}

        <AnimatePresence>
          {active && <CaseModal project={active} onClose={() => setActive(null)} />}
        </AnimatePresence>
      </div>
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold tracking-tight transition-all duration-300",
        active
          ? "border-cyan-400/60 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 shadow-[0_0_25px_-8px_rgba(34,211,238,0.7)]"
          : "border-slate-300 text-slate-600 hover:border-cyan-400/50 hover:text-cyan-500 dark:border-white/[0.09] dark:text-slate-400",
      )}
    >
      {children}
    </button>
  );
}

function CaseModal({ project, onClose }: { project: ShowcaseProject; onClose: () => void }) {
  const { t } = useI18n();
  const isPrivate = project.visibility === "private";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] grid place-items-center bg-ink-950/80 p-4 backdrop-blur-md"
    >
      <button type="button" aria-label={t.common.close} className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card relative z-10 max-h-[85vh] w-full max-w-2xl overflow-auto !bg-white/95 dark:!bg-ink-900/95"
      >
        <div className={clsx("relative h-40 overflow-hidden bg-gradient-to-br", project.cover)}>
          <div className="absolute inset-0 cyber-grid opacity-40" />
          <span className="absolute inset-0 grid place-items-center text-7xl text-white/25">{project.icon}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="absolute top-3 end-3 rounded-full bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.stage} label={t.status[project.stage]} />
            <span className="chip">{project.industry}</span>
            {isPrivate && (
              <span className="chip border-rose-400/40 text-rose-400">
                <Lock className="h-3 w-3" /> {t.common.confidential}
              </span>
            )}
          </div>

          <h3 className="mt-5 text-2xl font-black tracking-tight">{project.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{project.summary}</p>

          <dl className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Meta label={t.common.progress} value={`${project.progress}%`} />
            <Meta label={t.common.status} value={t.status[project.stage]} />
            <Meta label={t.portfolio.filters.visibility} value={isPrivate ? t.common.private : t.common.public} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span key={tech} className="chip font-mono">
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            {project.url && !isPrivate && (
              <a href={project.url} target="_blank" rel="noreferrer" className="btn-primary">
                <ExternalLink className="h-4 w-4" />
                {t.common.viewCase}
              </a>
            )}
            <button type="button" onClick={onClose} className="btn-ghost">
              {t.common.close}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mono-label !text-slate-400">{label}</dt>
      <dd className="mt-1.5 text-sm font-bold">{value}</dd>
    </div>
  );
}
