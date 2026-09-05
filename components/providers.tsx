"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, getDir, type Dictionary, type Locale } from "@/lib/i18n";

interface I18nValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <Providers>");
  return ctx;
}

interface ThemeValue {
  theme: "dark" | "light";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <Providers>");
  return ctx;
}

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("awwa-theme") : null;
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("awwa-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.cookie = `awwa-locale=${locale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = locale;
    document.documentElement.dir = getDir(locale);
  }, [locale]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const i18n = useMemo<I18nValue>(
    () => ({ locale, dir: getDir(locale), t: dictionaries[locale] }),
    [locale],
  );
  const themeValue = useMemo<ThemeValue>(() => ({ theme, toggle }), [theme, toggle]);

  return (
    <I18nContext.Provider value={i18n}>
      <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
    </I18nContext.Provider>
  );
}
