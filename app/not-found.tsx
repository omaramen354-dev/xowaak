import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en" dir="ltr">
      <body className="grid min-h-screen place-items-center bg-base text-ink-hi">
        <div className="text-center">
          <p className="text-7xl font-black text-gradient">404</p>
          <p className="mt-3 text-ink-low">This page could not be found.</p>
          <Link href="/en" className="mt-6 inline-block btn-primary">
            Back to AAKWHX
          </Link>
        </div>
      </body>
    </html>
  );
}
