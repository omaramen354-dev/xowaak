"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { useI18n } from "@/components/providers";
import { localeMeta, locales, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function switchTo(next: Locale) {
    const segments = pathname.split("/");
    segments[1] = next;
    // Assigning document.cookie is a browser API call, not a mutation of a
    // React value; the compiler cannot distinguish the two.
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `awwa-locale=${next}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    router.push(segments.join("/") || `/${next}`);
    router.refresh();
  }

  return (
    <div ref={wrapRef} className="relative">
      <Button variant="unstyled" size="auto"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.common.language}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-white/[0.02] px-3 py-2
                   text-sm font-medium text-ink-mid transition-colors hover:border-neon-cyan/50 hover:text-white"
      >
        <Globe className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">{localeMeta[locale].native}</span>
        <span className="font-mono text-xs sm:hidden">{locale.toUpperCase()}</span>
      </Button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-line
                     bg-surface p-1 shadow-card backdrop-blur-xl"
        >
          {locales.map((l) => (
            <li key={l}>
              <Button variant="unstyled" size="auto"
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => switchTo(l)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-start
                           text-sm text-ink-mid transition-colors hover:bg-neon-cyan/10 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden>{localeMeta[l].flag}</span>
                  {localeMeta[l].native}
                </span>
                {l === locale && <Check className="h-4 w-4 shrink-0 text-neon-cyan" />}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
