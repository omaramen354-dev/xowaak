# AWWA — AAKWHX Platform

Production-ready multilingual delivery platform for the AAKWHX technology agency,
built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** and **Supabase**.

## Systems

| System | Route | Description |
| --- | --- | --- |
| Public platform | `/{locale}` | Cinematic hero, services, filterable portfolio (public/private projects), process, testimonials |
| Quote estimator | `/{locale}/quote` | Interactive scope builder with live budget + timeline calculation |
| Client portal | `/{locale}/portal` | Stage tracker (Planning → Design → Development → Testing → Review), secure file delivery, feedback feed, messages |
| Admin / ERP | `/{locale}/admin` | Role-aware dashboard, project register, task kanban, team workload, client directory |

## Languages

`ar` (RTL) · `en` · `nl` · `de` · `tr` · `fr` · `es`

Locale is resolved by middleware from the `awwa-locale` cookie or `Accept-Language`,
then injected through `app/[locale]/layout.tsx`, which sets `dir` and `lang`.

## Roles

`super_admin`, `admin`, `pm`, `employee`, `client` — enforced in the UI by
`lib/permissions.ts` and in the database by the RLS policies in `supabase/schema.sql`.

## Design system

Ultra-modern high-tech aesthetic: glassmorphism surfaces, animated conic glow borders,
mesh-gradient + cyber-grid backdrops, canvas particle constellations, cursor spotlights,
3D tilt cards on a Bento grid, and a React Three Fiber hero core that tracks the pointer.

- **Typography** — Geist Sans (Latin UI), Cairo Variable (Arabic UI), JetBrains Mono
  Variable (numerals, code, mono labels). All self-hosted, zero external font requests.
- **Motion** — Framer Motion scroll reveals with staggered fade-up, layout-animated
  portfolio filtering, and `AnimatedCounter` count-ups triggered on viewport entry.
- **Accessibility** — full `prefers-reduced-motion` support; the 3D canvas and particle
  fields pause off-screen.

## Dynamic CMS

Nothing on the marketing page is hardcoded. `lib/content-store.tsx` holds the stats and
showcase projects, persists to localStorage, and syncs across tabs. Two admin modules
write to it:

- **Stats & Records** (`/admin` → Stats) — edit value, prefix/suffix, decimals, growth %
  and label, with a live preview strip.
- **Portfolio CMS** (`/admin` → Portfolio) — create / edit / delete projects with title,
  description, preview URL, icon, cover gradient, category, tech stack, progress,
  featured flag and the Public/Private visibility tag.

Any change is reflected immediately on the public showcase and the hero counters.

## Structure

```
app/[locale]/          route group per language (home, quote, portal, admin)
components/            public/ (hero, hero-3d, services, portfolio, process, quote)
                       portal/, admin/ (incl. cms-stats, cms-portfolio)
                       ui/ (motion, backgrounds, primitives, switchers)
lib/i18n/              locale config + 7 typed dictionaries
lib/supabase/          client.ts, server.ts, config.ts (fallbacks), types.ts
lib/                   content-store.tsx, mock-data.ts, permissions.ts, pricing.ts, fonts.ts
hooks/                 use-projects.ts, use-media-query.ts
supabase/schema.sql    tables, enums, triggers, RLS, storage policies
```

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — the app runs with mock data without it
npm run dev
```

Supabase credentials are optional: `lib/supabase/config.ts` falls back to safe
placeholders and `isSupabaseConfigured` makes the app serve the bundled demo
dataset, so the live preview never errors.

## Database

Apply `supabase/schema.sql` in the Supabase SQL editor. It creates
`profiles`, `user_roles`, `projects`, `project_members`, `project_milestones`,
`project_files`, `feedback`, `messages`, `quote_requests`, plus the
`project-files` private storage bucket and full row-level-security isolation
between clients.
