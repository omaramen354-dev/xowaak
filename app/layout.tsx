import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWWA — AAKWHX Digital Agency Platform",
  description:
    "AAKWHX builds platforms, AI systems and brand-grade interfaces. AWWA is our delivery platform: public site, client portal and internal ERP.",
  keywords: ["AAKWHX", "AWWA", "software agency", "Next.js", "ERP", "client portal"],
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('awwa-theme');
    var dark = stored ? stored === 'dark' : true;
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={fontVariables}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
