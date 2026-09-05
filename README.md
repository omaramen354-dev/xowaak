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

## Design system — strict dark

Single-theme, high-contrast dark UI. There is no light mode and no `dark:` variant in the
codebase; every colour comes from a token in `tailwind.config.ts`.

| Token | Value | Use |
| --- | --- | --- |
| `base` | `#07090E` | page background (pure deep black) |
| `surface` | `#0D111A` | cards, at 60% + `backdrop-blur-md` |
| `line` / `line-strong` | `#1E293B` / `#334155` | hairline borders |
| `ink-hi` | `#FFFFFF` | headings, extrabold — 21:1 contrast |
| `ink-mid` | `#CBD5E1` | body — 14.3:1 |
| `ink-low` | `#94A3B8` | secondary — 8.9:1 |
| `neon-cyan → neon-purple` | `#00F2FE · #4FACFE · #6366F1 · #A855F7` | accents, gradients, glows |

Depth comes only from `.mesh-deep` (deep radial gradients living inside the black) and
`.cyber-grid` — never from silver or light-grey fills.

## RTL / LTR correctness

- Logical properties throughout (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`,
  `text-start`) so Arabic mirrors automatically.
- `.flip-x` mirrors directional glyphs (arrows, quote marks); `.origin-inline-start`
  flips transform origins.
- Technical strings are pinned with `dir="ltr"` so they never reorder inside Arabic text.
- `shrink-0` on every icon and `whitespace-nowrap` on nav/CTA labels prevents the
  icon-over-text overlap that flex shrinking used to cause.
- Consistent spacing scale via `--section-y` / `.section-y` and `--card-p`.

## 3D hero

`components/public/hero-3d.tsx` — React Three Fiber scene loaded with
`dynamic(..., { ssr: false })`:

- wireframe icosahedron shell (cyan emissive)
- inner flat-shaded core with purple emissive material and a breathing pulse
- 900-point additive-blended holographic particle ring
- three inclined orbit lines

The whole rig eases toward the pointer (`MathUtils.lerp`) for a gyroscope-tilt feel.

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
