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

## Structure

```
app/[locale]/          route group per language (home, quote, portal, admin)
components/            public/, portal/, admin/, ui/, layout shell, providers
lib/i18n/              locale config + 7 typed dictionaries
lib/supabase/          client.ts, server.ts, config.ts (fallbacks), types.ts
lib/                   mock-data.ts, permissions.ts, pricing.ts
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
