"use client";

import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={clsx("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-start")}>
      {eyebrow && (
        <span className="chip border-brand-500/40 text-brand-500 dark:border-brand-400/30 dark:text-brand-300">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx("h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500 transition-[width] duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("surface p-6", className)}>{children}</div>;
}

const statusTone: Record<string, string> = {
  done: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  completed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  in_progress: "bg-brand-500/15 text-brand-400 border-brand-500/30",
  development: "bg-brand-500/15 text-brand-400 border-brand-500/30",
  testing: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  review: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  design: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
  planning: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  blocked: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  todo: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        statusTone[status] ?? statusTone.todo,
      )}
    >
      {label}
    </span>
  );
}
