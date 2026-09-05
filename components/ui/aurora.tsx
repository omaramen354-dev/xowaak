"use client";

import clsx from "clsx";

/**
 * Ambient aurora field — slow-drifting glowing orbs that keep the page alive.
 * Always sits at `z-backdrop` (z-index: 0) so it can never overlap content.
 */
export function Aurora({ className, variant = "full" }: { className?: string; variant?: "full" | "soft" }) {
  const soft = variant === "soft";

  return (
    <div aria-hidden className={clsx("pointer-events-none absolute inset-0 z-backdrop overflow-hidden", className)}>
      <div className="absolute inset-0 mesh-deep" />

      <div
        className={clsx(
          "aurora aurora-cyan animate-drift-a",
          soft ? "h-[26rem] w-[26rem] opacity-40" : "h-[34rem] w-[34rem] opacity-70",
          "-top-40 start-[8%] blur-[110px]",
        )}
      />
      <div
        className={clsx(
          "aurora aurora-magenta animate-drift-b",
          soft ? "h-[24rem] w-[24rem] opacity-35" : "h-[30rem] w-[30rem] opacity-60",
          "top-[12%] end-[4%] blur-[120px]",
        )}
      />
      <div
        className={clsx(
          "aurora aurora-purple animate-pulse-glow",
          soft ? "h-[22rem] w-[22rem] opacity-30" : "h-[28rem] w-[28rem] opacity-55",
          "bottom-[-8%] start-[38%] blur-[120px]",
        )}
      />
      {!soft && (
        <div className="aurora aurora-emerald animate-drift-b h-[20rem] w-[20rem] opacity-40 bottom-[6%] start-[-4%] blur-[110px]" />
      )}
    </div>
  );
}

/** Thin animated scan beam used as a section divider. */
export function BeamDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={clsx("relative h-px w-full overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
    </div>
  );
}
