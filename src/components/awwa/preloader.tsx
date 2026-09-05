"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const BOOT_LINES = [
  "تهيئة النواة البصرية",
  "مزامنة مدارات البيانات",
  "معايرة محرك الحركة",
  "فتح قناة الإشارة",
];

export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const fast = window.setTimeout(onDone, 250);
      return () => window.clearTimeout(fast);
    }

    const startedAt = performance.now();
    const duration = 2050;
    let frame = 0;
    let finished = false;

    const tick = (now: number) => {
      const t = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else if (!finished) {
        finished = true;
        window.setTimeout(onDone, 420);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  const activeLines = Math.max(1, Math.ceil((progress / 100) * BOOT_LINES.length));

  return (
    <motion.div
      className="preloader"
      initial={{ clipPath: "circle(141% at 50% 50%)" }}
      exit={{ clipPath: "circle(0% at 50% 42%)", transition: { duration: 0.9, ease: [0.83, 0, 0.17, 1] } }}
      aria-hidden="true"
    >
      <div className="preloader-grid" />
      <div className="preloader-core">
        <motion.div
          className="preloader-mark"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg viewBox="0 0 42 42" aria-hidden="true">
            <path d="M5 30 14 10l7 20 7-20 9 20" />
            <path className="logo-spark" d="M10 25h22" />
          </svg>
          <span>AWWA</span>
        </motion.div>

        <div className="preloader-lines" dir="rtl">
          {BOOT_LINES.map((line, index) => (
            <div key={line} className={index < activeLines ? "boot-line active" : "boot-line"}>
              <span className="boot-state" dir="ltr">
                {index < activeLines - 1 ? "OK" : index < activeLines ? "…" : ""}
              </span>
              <span>{line}</span>
              <i />
            </div>
          ))}
        </div>

        <div className="preloader-track">
          <motion.div className="preloader-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="preloader-percent" dir="ltr">
        {String(progress).padStart(3, "0")}
        <span>%</span>
      </div>
      <div className="preloader-caption" dir="ltr">INITIALIZING INTERFACE</div>
    </motion.div>
  );
}
