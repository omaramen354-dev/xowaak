"use client";

import { motion } from "framer-motion";
import { Database, ShieldCheck, Users } from "lucide-react";
import { useI18n } from "@/components/providers";

/**
 * Tilted holographic console that occupies the hero's visual column.
 *
 * Deliberately constrained to its own grid cell — it must never bleed into the
 * copy column. All motion here is idle (infinite, low amplitude): the shell
 * bobs, a scan line sweeps it, status dots pulse and the mini bar chart idles.
 */
export function HeroConsole() {
  const { t } = useI18n();
  const c = t.hero.console;

  const cards = [
    {
      icon: Users,
      label: c.portal.label,
      value: c.portal.value,
      meta: c.portal.meta,
      tone: "text-neon-cyan",
      dot: "bg-neon-cyan",
    },
    {
      icon: ShieldCheck,
      label: c.erp.label,
      value: c.erp.value,
      meta: c.erp.meta,
      tone: "text-neon-pink",
      dot: "bg-neon-pink",
    },
    {
      icon: Database,
      label: c.db.label,
      value: c.db.value,
      meta: c.db.meta,
      tone: "text-neon-emerald",
      dot: "bg-neon-emerald",
    },
  ];

  return (
    <div className="relative w-full">
      {/* Glow pad behind the console — backdrop layer, never over copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[8%] z-backdrop rounded-full bg-neon-cyan/20 blur-[90px] animate-pulse-glow"
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="relative z-stage"
      >
        <div className="animate-bob">
          <div className="console-tilt">
            <div className="console-shell p-4 sm:p-5">
              {/* Sweeping scan line */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-scan-y
                           bg-gradient-to-b from-transparent via-neon-cyan/12 to-transparent"
              />

              {/* Title bar */}
              <div className="relative flex items-center gap-1.5 border-b border-line/70 pb-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-neon-pink/80" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-neon-emerald/80" />
                <span className="ms-2 font-mono text-[10px] text-ink-faint sm:text-[11px]" dir="ltr">
                  aakwhx://control-deck
                </span>
                <span className="ms-auto inline-flex items-center gap-1.5">
                  <span className="live-dot bg-neon-emerald" />
                  <span className="font-mono text-[10px] font-semibold text-neon-emerald">{c.live}</span>
                </span>
              </div>

              {/* Console cards */}
              <div className="relative mt-4 space-y-2.5">
                {cards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.4 + i * 0.12 }}
                    className="console-row"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <card.icon className={`h-4 w-4 shrink-0 ${card.tone}`} />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-ink-hi">{card.label}</span>
                        <span className="block truncate text-[10px] text-ink-faint">{card.meta}</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className={`font-mono text-xs font-bold ${card.tone}`}>{card.value}</span>
                      <span className={`live-dot ${card.dot}`} />
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Idle activity graph */}
              <div className="relative mt-4 rounded-xl border border-line/80 bg-black/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-ink-faint">{c.throughput}</span>
                  <span className="font-mono text-[10px] font-bold text-neon-cyan">99.98%</span>
                </div>
                <div className="mt-2.5 flex h-12 items-end gap-1" dir="ltr">
                  {[38, 62, 45, 78, 55, 88, 64, 96, 71, 84, 58, 92].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 origin-bottom animate-bar-idle rounded-sm bg-gradient-to-t from-neon-cyan/30 to-neon-cyan"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.13}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* Footer link status */}
              <div className="relative mt-3 flex items-center justify-between rounded-xl border border-neon-emerald/25 bg-neon-emerald/[0.06] px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 shrink-0 text-neon-emerald animate-icon-pulse" />
                  <span className="text-[11px] font-semibold text-neon-emerald">{c.dbLink}</span>
                </span>
                <span className="font-mono text-[10px] text-neon-emerald/80 animate-blink-soft">{c.latency}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default HeroConsole;
