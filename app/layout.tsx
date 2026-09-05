import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWWA — AAKWHX Digital Agency Platform",
  description:
    "AAKWHX builds platforms, AI systems and brand-grade interfaces. AWWA is our delivery platform: public site, client portal and internal ERP.",
  keywords: ["AAKWHX", "AWWA", "software agency", "Next.js", "ERP", "client portal"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body className="bg-base text-ink-mid">{children}</body>
    </html>
  );
}
