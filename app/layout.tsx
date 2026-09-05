import type { Metadata } from "next";
import { headers } from "next/headers";
import { fontVariables } from "@/lib/fonts";
import { defaultLocale, getDir, isLocale } from "@/lib/i18n";
import { SceneMount } from "@/components/ui/scene-mount";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWWA — AAKWHX Digital Agency Platform",
  description:
    "AAKWHX builds platforms, AI systems and brand-grade interfaces. AWWA is our delivery platform: public site, client portal and internal ERP.",
  keywords: ["AAKWHX", "AWWA", "software agency", "Next.js", "ERP", "client portal"],
};

/**
 * Resolve the active locale from the request path so `<html lang/dir>` is
 * correct in the SERVER-rendered markup. Setting it only in a client effect
 * makes Arabic ship as LTR and then snap to RTL on hydration.
 */
async function resolveLocale() {
  const h = await headers();
  const path = h.get("x-invoke-path") ?? h.get("x-matched-path") ?? h.get("x-pathname") ?? "";
  const seg = path.split("/").filter(Boolean)[0];
  return isLocale(seg) ? seg : defaultLocale;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale();

  return (
    <html lang={locale} dir={getDir(locale)} className={fontVariables} suppressHydrationWarning>
      <body className="bg-base text-ink-mid">
        {/* Persistent ambient 3D field — fixed behind every page, always
            moving, never interactive. */}
        <SceneMount />
        {children}
      </body>
    </html>
  );
}
