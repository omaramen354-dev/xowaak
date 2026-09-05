"use client";

import Link from "next/link";
import { Globe2, Hexagon, Mail, Rss, Share2 } from "lucide-react";
import { useI18n } from "@/components/providers";

export function SiteFooter() {
  const { locale, t } = useI18n();
  const base = `/${locale}`;

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800/60">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
              <Hexagon className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-black tracking-widest">AAKWHX</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {t.brand.tagline} {t.footer.built}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">{t.footer.offices}</p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.nav.services}</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {t.services.items.slice(0, 4).map((s) => (
              <li key={s.title}>{s.title}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.nav.contact}</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <Link href={`${base}/quote`} className="hover:text-brand-500">
                {t.nav.quote}
              </Link>
            </li>
            <li>
              <Link href={`${base}/portal`} className="hover:text-brand-500">
                {t.nav.portal}
              </Link>
            </li>
            <li>
              <Link href={`${base}/admin`} className="hover:text-brand-500">
                {t.nav.admin}
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> hello@aakwhx.com
            </li>
          </ul>
          <div className="mt-4 flex gap-3 text-slate-400">
            <Globe2 className="h-4 w-4" />
            <Share2 className="h-4 w-4" />
            <Rss className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 dark:border-white/10">
        © {new Date().getFullYear()} AAKWHX · AWWA. {t.footer.rights}
      </div>
    </footer>
  );
}
