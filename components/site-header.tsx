"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Hexagon, LayoutDashboard, Menu, UserCircle2, X } from "lucide-react";
import { useI18n } from "@/components/providers";
import { LanguageSwitcher } from "@/components/ui/switchers";

export function SiteHeader() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /**
   * Close the mobile menu on navigation by DERIVING it during render rather
   * than firing an effect. The effect version rendered the open menu on the
   * new route first and closed it on a second pass; this closes it in the
   * same commit and costs no extra render.
   */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const base = `/${locale}`;
  const links = [
    { href: `${base}#services`, label: t.nav.services },
    { href: `${base}#portfolio`, label: t.nav.portfolio },
    { href: `${base}#process`, label: t.nav.process },
    { href: `${base}/quote`, label: t.nav.quote },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 ${
        scrolled ? "border-line bg-base/80 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center gap-4">
        {/* Brand — logical margin so it hugs the inline start in both directions */}
        <Link href={base} className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-cyan via-neon-blue to-neon-indigo text-white shadow-glow-cyan">
            <Hexagon className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-black tracking-widest text-ink-hi">AAKWHX</span>
            <span className="mono-label block">awwa</span>
          </span>
        </Link>

        {/* Nav takes the free space; ms-auto on the actions block keeps spacing symmetric in RTL */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-ink-low transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Link href={`${base}/portal`} className="btn-ghost whitespace-nowrap !px-3 !py-2 !text-xs">
              <UserCircle2 className="h-4 w-4 shrink-0" />
              {t.nav.portal}
            </Link>
            <Link href={`${base}/admin`} className="btn-ghost whitespace-nowrap !px-3 !py-2 !text-xs">
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              {t.nav.admin}
            </Link>
          </div>

          <LanguageSwitcher />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="rounded-xl border border-line-strong bg-white/[0.02] p-2.5 text-ink-mid transition-colors hover:border-neon-cyan/50 hover:text-white lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-base/95 backdrop-blur-xl lg:hidden">
          <nav className="container-x flex flex-col gap-1 py-4">
            {[
              ...links,
              { href: `${base}/portal`, label: t.nav.portal },
              { href: `${base}/admin`, label: t.nav.admin },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2.5 text-start text-sm font-medium text-ink-mid transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
