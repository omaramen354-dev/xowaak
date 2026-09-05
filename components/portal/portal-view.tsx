"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  CircleDot,
  Download,
  FileArchive,
  FileSignature,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Receipt,
  Send,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useI18n } from "@/components/providers";
import { ProgressBar, StatusBadge } from "@/components/ui/primitives";
import {
  getProfile,
  projectFeedback,
  projectFiles,
  projectMessages,
  projectMilestones,
  projects,
} from "@/lib/mock-data";
import type { Feedback, FeedbackCategory, FileCategory, ProjectStage } from "@/lib/supabase/types";

const STAGES: ProjectStage[] = ["planning", "design", "development", "testing", "review"];

const fileIcons: Record<FileCategory, typeof FileText> = {
  design: ImageIcon,
  document: FileText,
  contract: FileSignature,
  source: FileArchive,
  invoice: Receipt,
};

/** The signed-in demo client. In production this comes from Supabase auth + RLS. */
const CLIENT_ID = "u-101";

export function PortalView() {
  const { t, locale } = useI18n();
  const clientProjects = useMemo(() => projects.filter((p) => p.client_id === CLIENT_ID), []);
  const [projectId, setProjectId] = useState(clientProjects[0].id);
  const [tab, setTab] = useState<"overview" | "files" | "feedback" | "messages">("overview");

  const project = clientProjects.find((p) => p.id === projectId)!;
  const milestones = projectMilestones(project.id);
  const files = projectFiles(project.id);
  const client = getProfile(CLIENT_ID)!;

  const [feedbackList, setFeedbackList] = useState<Feedback[]>(() => projectFeedback(project.id));
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("design");

  function selectProject(id: string) {
    setProjectId(id);
    setFeedbackList(projectFeedback(id));
  }

  function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setFeedbackList((prev) => [
      ...prev,
      {
        id: `fb-local-${prev.length + 1}`,
        project_id: project.id,
        author_id: CLIENT_ID,
        category,
        body: draft.trim(),
        resolved: false,
        created_at: new Date().toISOString(),
      },
    ]);
    setDraft("");
  }

  const currentStageIndex = STAGES.indexOf(project.stage === "completed" ? "review" : project.stage);
  const nextMilestone = milestones.find((m) => m.status !== "done");

  return (
    <section className="py-12">
      <div className="container-x">
        <header className="surface flex flex-wrap items-center justify-between gap-5 p-6">
          <div>
            <span className="chip border-brand-500/40 text-brand-500">{t.portal.title}</span>
            <h1 className="mt-3 text-2xl font-black">
              {t.portal.welcome}, {client.full_name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {client.company} · {client.title}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500">
            <ShieldCheck className="h-4 w-4" />
            End-to-end encrypted workspace
          </div>
        </header>

        <div className="mt-5 flex flex-wrap gap-2">
          {clientProjects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectProject(p.id)}
              className={clsx(
                "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                p.id === projectId
                  ? "border-brand-500 bg-brand-500/10 text-brand-500"
                  : "border-slate-300 text-slate-600 hover:border-brand-400 dark:border-white/10 dark:text-slate-300",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{project.name}</h2>
                <StatusBadge status={project.stage} label={t.status[project.stage]} />
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{project.summary}</p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">{t.portal.completion}</span>
                  <span className="tabular-nums text-brand-500">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} />
              </div>

              <ol className="mt-8 grid gap-3 sm:grid-cols-5">
                {STAGES.map((stage, i) => {
                  const done = i < currentStageIndex || project.stage === "completed";
                  const current = i === currentStageIndex && project.stage !== "completed";
                  return (
                    <li key={stage} className="relative">
                      <div className="flex items-center gap-2">
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : current ? (
                          <CircleDot className="h-5 w-5 animate-pulse text-brand-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 dark:text-white/20" />
                        )}
                        <span
                          className={clsx(
                            "text-xs font-bold",
                            done ? "text-emerald-500" : current ? "text-brand-500" : "text-slate-400",
                          )}
                        >
                          {t.status[stage]}
                        </span>
                      </div>
                      <div className="mt-2 h-1 rounded-full bg-slate-200 dark:bg-white/10">
                        <div
                          className={clsx(
                            "h-full rounded-full",
                            done ? "w-full bg-emerald-500" : current ? "w-1/2 bg-brand-500" : "w-0",
                          )}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="surface p-2">
              <nav className="flex flex-wrap gap-1">
                {(["overview", "files", "feedback", "messages"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={clsx(
                      "rounded-lg px-4 py-2 text-sm font-semibold transition",
                      tab === key
                        ? "bg-brand-500 text-white"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
                    )}
                  >
                    {t.portal.tabs[key]}
                  </button>
                ))}
              </nav>
            </div>

            {tab === "overview" && (
              <div className="surface p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">{t.portal.milestones}</h3>
                <ul className="mt-5 space-y-3">
                  {milestones.map((m) => {
                    const owner = m.assignee_id ? getProfile(m.assignee_id) : null;
                    return (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-white/10"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{m.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {t.status[m.stage]} · {owner?.full_name ?? "—"} · {m.due_date}
                          </p>
                        </div>
                        <StatusBadge status={m.status} label={t.status[m.status]} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {tab === "files" && (
              <div className="surface p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">{t.portal.filesTitle}</h3>
                    <p className="mt-1 text-xs text-slate-500">{t.portal.filesSubtitle}</p>
                  </div>
                  <button type="button" className="btn-ghost !py-2 text-xs">
                    <Upload className="h-4 w-4" />
                    {t.common.upload}
                  </button>
                </div>
                <ul className="mt-5 divide-y divide-slate-200 dark:divide-white/10">
                  {files.map((f) => {
                    const Icon = fileIcons[f.category];
                    const uploader = getProfile(f.uploaded_by);
                    return (
                      <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{f.name}</p>
                            <p className="text-xs text-slate-500">
                              {f.version} · {(f.size_kb / 1024).toFixed(1)} MB · {uploader?.full_name} · {f.created_at}
                            </p>
                          </div>
                        </div>
                        <button type="button" className="btn-ghost !px-3 !py-2 text-xs">
                          <Download className="h-4 w-4" />
                          {t.common.download}
                        </button>
                      </li>
                    );
                  })}
                  {files.length === 0 && <li className="py-6 text-sm text-slate-500">{t.common.empty}</li>}
                </ul>
              </div>
            )}

            {tab === "feedback" && (
              <div className="surface p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">{t.portal.feedbackTitle}</h3>

                <ul className="mt-5 space-y-4">
                  {feedbackList.map((item) => {
                    const author = getProfile(item.author_id);
                    const isClient = item.author_id === CLIENT_ID;
                    return (
                      <li key={item.id} className={clsx("flex gap-3", isClient && "flex-row-reverse text-end")}>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs font-bold text-white">
                          {(author?.full_name ?? "?").charAt(0)}
                        </span>
                        <div
                          className={clsx(
                            "max-w-xl rounded-2xl border p-4",
                            isClient
                              ? "border-brand-500/30 bg-brand-500/10"
                              : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]",
                          )}
                        >
                          <div className={clsx("flex flex-wrap items-center gap-2", isClient && "justify-end")}>
                            <span className="text-xs font-bold">{author?.full_name}</span>
                            <span className="chip !px-2 !py-0.5 !text-[10px]">{t.portal.categories[item.category]}</span>
                            {item.resolved && (
                              <span className="text-[10px] font-bold uppercase text-emerald-500">✓ {t.status.done}</span>
                            )}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{item.body}</p>
                          <p className="mt-2 text-[11px] text-slate-400">
                            {new Date(item.created_at).toLocaleString(locale)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <form onSubmit={submitFeedback} className="mt-6 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(["design", "content", "bug", "scope"] as FeedbackCategory[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={clsx(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          category === c
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-slate-300 text-slate-600 dark:border-white/10 dark:text-slate-300",
                        )}
                      >
                        {t.portal.categories[c]}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t.portal.feedbackPlaceholder}
                    className="field resize-none"
                  />
                  <button type="submit" className="btn-primary">
                    <Send className="h-4 w-4 flip-x" />
                    {t.portal.postFeedback}
                  </button>
                </form>
              </div>
            )}

            {tab === "messages" && (
              <div className="surface p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">{t.portal.tabs.messages}</h3>
                <ul className="mt-5 space-y-3">
                  {projectMessages(project.id).map((m) => {
                    const sender = getProfile(m.sender_id);
                    return (
                      <li key={m.id} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5 text-brand-500" />
                          <span className="text-xs font-bold">{sender?.full_name}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(m.created_at).toLocaleString(locale)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{m.body}</p>
                      </li>
                    );
                  })}
                  {projectMessages(project.id).length === 0 && (
                    <li className="py-6 text-sm text-slate-500">{t.common.empty}</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="surface p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.portal.nextDelivery}</h3>
              {nextMilestone ? (
                <>
                  <p className="mt-3 text-sm font-semibold">{nextMilestone.title}</p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {nextMilestone.due_date}
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={nextMilestone.status} label={t.status[nextMilestone.status]} />
                  </div>
                </>
              ) : (
                <p className="mt-3 flex items-center gap-2 text-sm text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" /> {t.status.completed}
                </p>
              )}
            </div>

            <div className="surface p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.common.team}</h3>
              <ul className="mt-4 space-y-3">
                {["u-003", "u-004", "u-005"].map((id) => {
                  const member = getProfile(id)!;
                  return (
                    <li key={id} className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs font-bold text-white">
                        {member.full_name.charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{member.full_name}</p>
                        <p className="text-xs text-slate-500">{member.title}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="surface p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.common.budget}</h3>
              <p className="mt-3 text-2xl font-black tabular-nums text-gradient">
                {new Intl.NumberFormat(locale, { style: "currency", currency: project.currency, maximumFractionDigits: 0 }).format(
                  project.budget,
                )}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t.common.deadline}: {project.deadline}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
