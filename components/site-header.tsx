"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Hexagon, LayoutDashboard, Menu, UserCircle2 } from "lucide-react";
import { useI18n } from "@/components/providers";
import { LanguageSwitcher } from "@/components/ui/switchers";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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

  // Always dark + frosted, never transparent: over the animated 3D field a
  // transparent bar left the nav unreadable. Scrolling only deepens the tint
  // and adds the shadow.
  return (
    <header
      className={cn(
        // `sticky` already creates the positioning context for the hairline —
        // adding `relative` here made tailwind-merge drop `sticky` entirely.
        "sticky top-0 z-50 w-full border-b backdrop-blur-xl backdrop-saturate-150 transition-all duration-300",
        "supports-[backdrop-filter]:bg-base/70",
        scrolled
          ? "border-line bg-base/90 shadow-[0_10px_40px_-24px_rgba(0,0,0,1)] supports-[backdrop-filter]:bg-base/85"
          : "border-line/60 bg-base/80",
      )}
    >
      {/* Neon hairline along the bottom edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/45 to-transparent"
      />

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
            <Button asChild variant="ghostNeon" className="whitespace-nowrap !px-3 !py-2 !text-xs">
<Link href={`${base}/portal`}>
              <UserCircle2 className="h-4 w-4 shrink-0" />
              {t.nav.portal}
            </Link>
</Button>
            <Button asChild variant="ghostNeon" className="whitespace-nowrap !px-3 !py-2 !text-xs">
<Link href={`${base}/admin`}>
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              {t.nav.admin}
            </Link>
</Button>
          </div>

          <LanguageSwitcher />

          {/* Radix Sheet: focus trap, scroll lock, Escape and focus restore,
              none of which the previous conditional <div> had. */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="unstyled"
                size="auto"
                type="button"
                aria-label="Menu"
                className="rounded-xl border border-line-strong bg-white/[0.02] p-2.5 text-ink-mid transition-colors hover:border-neon-cyan/50 hover:text-white lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="end" className="lg:hidden">
              <SheetHeader>
                <SheetTitle>{t.nav.menu}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {[
                  ...links,
                  { href: `${base}/portal`, label: t.nav.portal },
                  { href: `${base}/admin`, label: t.nav.admin },
                ].map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Link
                      href={l.href}
                      className="rounded-lg px-3 py-2.5 text-start text-sm font-medium text-ink-mid transition-colors hover:bg-white/[0.05] hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

    </header>
  );
}
