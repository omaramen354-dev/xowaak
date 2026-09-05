"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, Lock, Unlock } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading, ProgressBar, StatusBadge } from "@/components/ui/primitives";
import { industries, projects } from "@/lib/mock-data";
import type { Project, Visibility } from "@/lib/supabase/types";

export function Portfolio() {
  const { t } = useI18n();
  const [industry, setIndustry] = useState<string>("all");
  const [visibility, setVisibility] = useState<Visibility | "all">("all");
  const [active, setActive] = useState<Project | null>(null);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) => (industry === "all" || p.industry === industry) && (visibility === "all" || p.visibility === visibility),
      ),
    [industry, visibility],
  );

  return (
    <section id="portfolio" className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 h-64 bg-gradient-to-b from-brand-600/5 to-transparent" />
      <div className="container-x relative">
        <SectionHeading eyebrow="02" title={t.portfolio.title} subtitle={t.portfolio.subtitle} />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <FilterPill active={industry === "all"} onClick={() => setIndustry("all")}>
            {t.common.all}
          </FilterPill>
          {industries.map((ind) => (
            <FilterPill key={ind} active={industry === ind} onClick={() => setIndustry(ind)}>
              {ind}
            </FilterPill>
          ))}
          <span className="mx-2 hidden h-5 w-px bg-slate-300 sm:block dark:bg-white/10" />
          <FilterPill active={visibility === "public"} onClick={() => setVisibility(visibility === "public" ? "all" : "public")}>
            <Unlock className="h-3 w-3" /> {t.common.public}
          </FilterPill>
          <FilterPill active={visibility === "private"} onClick={() => setVisibility(visibility === "private" ? "all" : "private")}>
            <Lock className="h-3 w-3" /> {t.common.private}
          </FilterPill>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setActive(project)}
              className="surface group overflow-hidden p-0 text-start transition hover:-translate-y-1 hover:border-brand-500/50"
            >
              <div className={clsx("relative h-40 bg-gradient-to-br", project.cover)}>
                <div className="absolute inset-0 grid-bg opacity-30" />
                <span className="absolute top-3 end-3">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur",
                      project.visibility === "private"
                        ? "border-rose-400/40 bg-rose-500/15 text-rose-200"
                        : "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
                    )}
                  >
                    {project.visibility === "private" ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    {project.visibility === "private" ? t.common.private : t.common.public}
                  </span>
                </span>
                <span className="absolute bottom-3 start-3 text-xs font-mono uppercase tracking-widest text-white/80">
                  {project.industry}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold leading-snug">{project.name}</h3>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-brand-500" />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{project.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tech.slice(0, 3).map((tech) => (
                    <span key={tech} className="chip !px-2 !py-0.5 !text-[10px]">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={project.progress} className="!h-1.5" />
                  <span className="text-xs font-bold tabular-nums text-slate-500">{project.progress}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {active && <CaseModal project={active} onClose={() => setActive(null)} />}
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
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition",
        active
          ? "border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-600/25"
          : "border-slate-300 text-slate-600 hover:border-brand-500 hover:text-brand-500 dark:border-white/10 dark:text-slate-300",
      )}
    >
      {children}
    </button>
  );
}

function CaseModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { t } = useI18n();
  const isPrivate = project.visibility === "private";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink-900/70 p-4 backdrop-blur-sm">
      <button type="button" aria-label={t.common.close} className="absolute inset-0" onClick={onClose} />
      <div className="surface relative z-10 max-h-[85vh] w-full max-w-2xl overflow-auto !bg-white p-0 dark:!bg-ink-800">
        <div className={clsx("relative h-36 bg-gradient-to-br", project.cover)}>
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>
        <div className="p-7">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.stage} label={t.status[project.stage]} />
            <span className="chip">{project.industry}</span>
            {isPrivate && (
              <span className="chip border-rose-400/40 text-rose-400">
                <Lock className="h-3 w-3" /> {t.common.confidential}
              </span>
            )}
          </div>
          <h3 className="mt-4 text-2xl font-black">{project.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{project.summary}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Meta label={t.common.progress} value={`${project.progress}%`} />
            <Meta
              label={t.common.budget}
              value={isPrivate ? "—" : `${(project.budget / 1000).toFixed(0)}k ${project.currency}`}
            />
            <Meta label={t.common.deadline} value={project.deadline} />
            <Meta label={t.common.status} value={t.status[project.stage]} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-7 flex justify-end">
            <button type="button" onClick={onClose} className="btn-ghost">
              {t.common.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}
