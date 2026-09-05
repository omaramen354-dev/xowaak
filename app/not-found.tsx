import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en" className="dark">
      <body className="grid min-h-screen place-items-center bg-ink-900 text-slate-100">
        <div className="text-center">
          <p className="text-7xl font-black text-brand-500">404</p>
          <p className="mt-3 text-slate-400">This page could not be found.</p>
          <Link href="/en" className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold">
            Back to AAKWHX
          </Link>
        </div>
      </body>
    </html>
  );
}
