"use client";

import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Link2, Lock, Pencil, Plus, Star, Trash2, Unlock, X } from "lucide-react";
import { useI18n } from "@/components/providers";
import {
  emptyProject,
  gradientPresets,
  iconPresets,
  useContent,
  type ShowcaseProject,
} from "@/lib/content-store";
import type { ProjectStage, Visibility } from "@/lib/supabase/types";

const stages: ProjectStage[] = ["planning", "design", "development", "testing", "review", "completed"];

/** CMS — Portfolio manager: create, edit, delete showcase projects. */
export function CmsPortfolio() {
  const { t } = useI18n();
  const { showcase, upsertProject, removeProject } = useContent();
  const [draft, setDraft] = useState<ShowcaseProject | null>(null);
  const [techInput, setTechInput] = useState("");

  function openNew() {
    setDraft(emptyProject());
    setTechInput("");
  }

  function openEdit(project: ShowcaseProject) {
    setDraft({ ...project });
    setTechInput(project.tech.join(", "));
  }

  function save() {
    if (!draft || !draft.name.trim()) return;
    upsertProject({
      ...draft,
      tech: techInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setDraft(null);
  }

  return (
    <div className="space-y-5">
      <div className="glass-card flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h3 className="mono-label">CMS / SHOWCASE</h3>
          <p className="mt-2 text-lg font-bold">{t.admin.tabs.cmsPortfolio}</p>
          <p className="mt-1 text-xs text-slate-500">{t.admin.cms.portfolioHint}</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary !py-2 text-xs">
          <Plus className="h-4 w-4" />
          {t.admin.cms.addProject}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {showcase.map((project) => (
          <motion.div key={project.id} layout className="glass-card overflow-hidden">
            <div className={clsx("relative h-24 bg-gradient-to-br", project.cover)}>
              <div className="absolute inset-0 cyber-grid opacity-40" />
              <span className="absolute inset-0 grid place-items-center text-3xl text-white/40">{project.icon}</span>
              {project.featured && (
                <Star className="absolute top-2 end-2 h-4 w-4 fill-amber-400 text-amber-400" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold leading-snug">{project.name || "—"}</h4>
                <span
                  className={clsx(
                    "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase",
                    project.visibility === "private"
                      ? "border-rose-400/40 text-rose-400"
                      : "border-emerald-400/40 text-emerald-400",
                  )}
                >
                  {project.visibility === "private" ? t.common.private : t.common.public}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-slate-500">{project.summary}</p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                <span className="chip !px-2 !py-0.5 !text-[9px]">{project.industry}</span>
                <span className="tabular">{project.progress}%</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => openEdit(project)} className="btn-ghost flex-1 !py-1.5 !text-[11px]">
                  <Pencil className="h-3.5 w-3.5" />
                  {t.admin.cms.edit}
                </button>
                <button
                  type="button"
                  onClick={() => removeProject(project.id)}
                  aria-label={t.admin.cms.delete}
                  className="grid h-8 w-8 place-items-center rounded-xl border border-rose-500/30 text-rose-400 transition hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/80 p-4 backdrop-blur-md"
          >
            <button type="button" aria-label={t.common.cancel} className="absolute inset-0" onClick={() => setDraft(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="glass-card relative z-10 max-h-[88vh] w-full max-w-2xl overflow-auto !bg-white/95 p-7 dark:!bg-ink-900/95"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black">{t.admin.cms.addProject}</h3>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  aria-label={t.common.close}
                  className="rounded-full p-2 text-slate-400 hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <Labeled label={t.admin.cms.projectName}>
                  <input
                    className="field"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </Labeled>

                <Labeled label={t.admin.cms.description}>
                  <textarea
                    rows={3}
                    className="field resize-none"
                    value={draft.summary}
                    onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                  />
                </Labeled>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Labeled label={t.admin.cms.category}>
                    <input
                      className="field"
                      value={draft.industry}
                      onChange={(e) => setDraft({ ...draft, industry: e.target.value })}
                    />
                  </Labeled>
                  <Labeled label={t.admin.cms.previewUrl}>
                    <div className="relative">
                      <Link2 className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 start-3" />
                      <input
                        className="field ps-9"
                        placeholder="https://…"
                        value={draft.url}
                        onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                      />
                    </div>
                  </Labeled>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Labeled label={t.common.status}>
                    <select
                      className="field"
                      value={draft.stage}
                      onChange={(e) => setDraft({ ...draft, stage: e.target.value as ProjectStage })}
                    >
                      {stages.map((s) => (
                        <option key={s} value={s}>
                          {t.status[s]}
                        </option>
                      ))}
                    </select>
                  </Labeled>
                  <Labeled label={`${t.common.progress} — ${draft.progress}%`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      className="w-full accent-cyan-400"
                      value={draft.progress}
                      onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
                    />
                  </Labeled>
                </div>

                <Labeled label={t.admin.cms.tech}>
                  <input
                    className="field font-mono text-xs"
                    placeholder="Next.js, Supabase, Terraform"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                  />
                </Labeled>

                <Labeled label={t.admin.cms.visibility}>
                  <div className="flex gap-2">
                    {(["public", "private"] as Visibility[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setDraft({ ...draft, visibility: v })}
                        className={clsx(
                          "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                          draft.visibility === v
                            ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300"
                            : "border-slate-300 text-slate-500 dark:border-white/10",
                        )}
                      >
                        {v === "private" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        {v === "private" ? t.common.private : t.common.public}
                      </button>
                    ))}
                  </div>
                </Labeled>

                <Labeled label={t.admin.cms.icon}>
                  <div className="flex flex-wrap gap-2">
                    {iconPresets.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setDraft({ ...draft, icon })}
                        className={clsx(
                          "grid h-10 w-10 place-items-center rounded-xl border text-lg transition",
                          draft.icon === icon
                            ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300"
                            : "border-slate-300 text-slate-500 dark:border-white/10",
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </Labeled>

                <Labeled label={t.admin.cms.cover}>
                  <div className="flex flex-wrap gap-2">
                    {gradientPresets.map((cover) => (
                      <button
                        key={cover}
                        type="button"
                        onClick={() => setDraft({ ...draft, cover })}
                        aria-label="cover"
                        className={clsx(
                          "h-10 w-16 rounded-xl border bg-gradient-to-br transition",
                          cover,
                          draft.cover === cover ? "border-cyan-400 ring-2 ring-cyan-400/40" : "border-white/10",
                        )}
                      />
                    ))}
                  </div>
                </Labeled>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-cyan-400"
                    checked={draft.featured}
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                  />
                  <span className="text-sm font-medium">{t.admin.cms.featured}</span>
                </label>
              </div>

              <div className="mt-7 flex justify-end gap-3">
                <button type="button" onClick={() => setDraft(null)} className="btn-ghost">
                  {t.common.cancel}
                </button>
                <button type="button" onClick={save} className="btn-primary">
                  <Check className="h-4 w-4" />
                  {t.admin.cms.save}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mono-label mb-1.5 block !text-slate-500">{label}</span>
      {children}
    </label>
  );
}
