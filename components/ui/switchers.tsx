"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Globe, Moon, Sun } from "lucide-react";
import { useI18n, useTheme } from "@/components/providers";
import { localeMeta, locales, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function switchTo(next: Locale) {
    const segments = pathname.split("/");
    segments[1] = next;
    document.cookie = `awwa-locale=${next}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    router.push(segments.join("/") || `/${next}`);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.common.language}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-cyan-400 hover:text-cyan-500 dark:border-white/[0.1] dark:text-slate-200 dark:hover:border-cyan-400/60"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeMeta[locale].native}</span>
        <span className="sm:hidden">{locale.toUpperCase()}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul className="absolute z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-2xl end-0 dark:border-white/[0.08] dark:bg-ink-900/95 backdrop-blur-xl">
            {locales.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  onClick={() => switchTo(l)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-cyan-400/10 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{localeMeta[l].flag}</span>
                    {localeMeta[l].native}
                  </span>
                  {l === locale && <Check className="h-4 w-4 text-cyan-400" />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function ThemeSwitcher() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${t.common.theme}: ${theme === "dark" ? t.common.dark : t.common.light}`}
      className="rounded-xl border border-slate-300 p-2.5 text-slate-700 transition hover:border-cyan-400 hover:text-cyan-500 dark:border-white/[0.1] dark:text-slate-200 dark:hover:border-cyan-400/60"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
