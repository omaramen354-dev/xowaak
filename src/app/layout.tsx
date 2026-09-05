import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/cairo";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://awwa.studio"),
  title: "AWWA — نصنع تجارب رقمية من المستقبل",
  description:
    "استوديو رقمي مستقل يبني العلامات والمنصات والمنتجات الذكية بتجارب استثنائية تجمع التصميم والتقنية.",
  keywords: ["تصميم رقمي", "تطوير مواقع", "تجربة مستخدم", "AWWA", "استوديو إبداعي"],
  openGraph: {
    title: "AWWA — المستقبل يبدأ من هنا",
    description: "نحوّل الأفكار الجريئة إلى منتجات رقمية يتذكرها الناس.",
    locale: "ar_SA",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#05070e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body>{children}</body>
    </html>
  );
}
