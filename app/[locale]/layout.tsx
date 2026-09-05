import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fontVariables } from "@/lib/fonts";
import { SceneMount } from "@/components/ui/scene-mount";
import { CursorGlow, ScrollProgress } from "@/components/ui/chrome";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";
import { getDir, isLocale, locales } from "@/lib/i18n";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * This segment owns <html>, not the root layout.
 *
 * `lang` and `dir` therefore come from the route params and are correct in
 * the SERVER-rendered markup — Arabic ships as RTL rather than shipping LTR
 * and snapping on hydration — while every page still prerenders statically.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} dir={getDir(locale)} className={fontVariables} suppressHydrationWarning>
      <body className="bg-base text-ink-mid">
        {/* One full-page aurora (react-bits shader) behind everything, plus
            the persistent ambient 3D field. Both are fixed and never
            interactive. */}
        <AuroraBackdrop />
        <SceneMount />
        <CursorGlow />
        <ScrollProgress />

        <Providers locale={locale}>
          {/* relative + z-content keeps every page above the fixed 3D field. */}
          <div className="relative z-content flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
