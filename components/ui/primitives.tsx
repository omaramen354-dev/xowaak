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
        <span className="mono-label inline-block rounded-full border border-neon-cyan/30 bg-neon-cyan/[0.06] px-3 py-1.5">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-5 text-3xl sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-ink-low">{subtitle}</p>}
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
      className={clsx("h-2 w-full overflow-hidden rounded-full bg-line", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple shadow-glow-cyan transition-[width] duration-1000 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("glass-card p-6", className)}>{children}</div>;
}

const statusTone: Record<string, string> = {
  done: "bg-neon-emerald/15 text-neon-emerald border-neon-emerald/35",
  completed: "bg-neon-emerald/15 text-neon-emerald border-neon-emerald/35",
  in_progress: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/35",
  development: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/35",
  testing: "bg-amber-400/15 text-amber-300 border-amber-400/35",
  review: "bg-neon-purple/15 text-neon-purple border-neon-purple/35",
  design: "bg-neon-indigo/15 text-neon-blue border-neon-indigo/35",
  planning: "bg-neon-blue/15 text-neon-blue border-neon-blue/35",
  blocked: "bg-rose-500/15 text-rose-300 border-rose-500/35",
  todo: "bg-white/[0.06] text-ink-low border-line-strong",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-tight backdrop-blur",
        statusTone[status] ?? statusTone.todo,
      )}
    >
      {label}
    </span>
  );
}
