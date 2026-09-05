"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Hexagon, LayoutDashboard, Menu, UserCircle2, X } from "lucide-react";
import { useI18n } from "@/components/providers";
import { LanguageSwitcher, ThemeSwitcher } from "@/components/ui/switchers";

export function SiteHeader() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const base = `/${locale}`;
  const links = [
    { href: `${base}#services`, label: t.nav.services },
    { href: `${base}#portfolio`, label: t.nav.portfolio },
    { href: `${base}#process`, label: t.nav.process },
    { href: `${base}/quote`, label: t.nav.quote },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all ${
        scrolled
          ? "border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/80"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href={base} className="flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-lg shadow-brand-600/30">
            <Hexagon className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-black tracking-widest">AAKWHX</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.28em] text-brand-500">awwa</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Link href={`${base}/portal`} className="btn-ghost !px-3 !py-2 text-xs">
              <UserCircle2 className="h-4 w-4" />
              {t.nav.portal}
            </Link>
            <Link href={`${base}/admin`} className="btn-ghost !px-3 !py-2 text-xs">
              <LayoutDashboard className="h-4 w-4" />
              {t.nav.admin}
            </Link>
          </div>
          <ThemeSwitcher />
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="rounded-xl border border-slate-300 p-2.5 lg:hidden dark:border-white/10"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 lg:hidden dark:border-white/10 dark:bg-ink-900">
          <nav className="flex flex-col gap-1">
            {[...links, { href: `${base}/portal`, label: t.nav.portal }, { href: `${base}/admin`, label: t.nav.admin }].map(
              (l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
