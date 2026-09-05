# AWWA Platform — Agent Briefing

Read this before editing. It records constraints discovered the hard way.

## Stack

Next.js 15.5.25 (App Router) · TypeScript 5 · Tailwind CSS · Framer Motion · React Three Fiber
Supabase-ready (runs on mock data without any credentials).

## Commands

```bash
npm install
npm run dev      # 0.0.0.0:3000, builds into .next
npm run build    # BUILD_DIST=1 -> builds into .next-build
npm start        # BUILD_DIST=1
```

## HARD RULES — violating these breaks the app

### 1. Never remove the webpack alias in `next.config.mjs`

The `@/*` alias in `tsconfig.json` alone does **not** work in this setup;
`next build` fails with `Module not found: Can't resolve '@/components/...'`.
The working fix is the explicit alias in the webpack hook plus `turbopack.resolveAlias`.
Adding `baseUrl` or deleting `.next` does not substitute for it.

### 2. Do not upgrade TypeScript past 5.x

`typescript@7.x` is rejected by Next 15.5.25:
"native compiler does not provide the JavaScript compiler API".

### 3. Never use `next/font/google`

Google Fonts was unreachable during development. Fonts are self-hosted via
`@fontsource-variable/*` CSS imports. Keep it that way — it also removes a runtime
dependency on an external host.

### 4. `dev` and `build` must not share a `distDir`

Running `next build` while `next dev` is live overwrites the chunks the dev server
is serving, producing:
- `TypeError: __webpack_modules__[moduleId] is not a function`
- `Cannot find module './vendor-chunks/*.js'`

This is **not** a stale cache — do not "fix" it by deleting `.next` and moving on.
It is already prevented structurally by the `BUILD_DIST` switch. Keep that switch.

### 5. Custom `z-*` utilities must live in `tailwind.config.ts`

Declaring `.z-backdrop` etc. in `@layer utilities` **silently emits nothing** —
the names collide with Tailwind's built-in `z-` namespace. They belong in
`theme.extend.zIndex`.

### 6. Keyframes referenced only from raw CSS must be written in `globals.css`

Tailwind only emits config `keyframes` when a matching `animate-*` class appears
in scanned content. `gradient-pan` is used inside `.text-gradient` in raw CSS,
so its `@keyframes` is declared directly in `globals.css`. Do not move it.

### 7. Restart the dev server after editing `tailwind.config.ts`

The config is cached; otherwise every route 500s with "class does not exist".

### 8. Verify icon names before importing from `lucide-react`

The installed version does **not** export `Github`, `Linkedin`, or `Twitter`.

### 9. `origin-start` is not a Tailwind class

Use the custom `.origin-inline-start` utility.

## Layering contract

Enforced through `theme.extend.zIndex`. Never use `z-[…]` arbitrary literals.

| Token | Value | Use |
|---|---|---|
| `z-backdrop` | 0 | mesh, cyber-grid, aurora orbs — always `pointer-events-none` |
| `z-stage` | 10 | the 3D canvas only |
| `z-content` | 20 | all copy, stats, CTAs |
| `z-overlay` | 60 | modals |

The hero avoids text/3D overlap **structurally**, not by tuning: it is a two-column
grid `lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]` with the canvas `absolute inset-0`
scoped to its own grid cell. Do not collapse this back to a single stacking context.

## Palette

`neon-cyan #00F2FE` · `neon-sky #00D2FF` · `neon-blue #4FACFE` · `neon-indigo #8B5CF6`
`neon-purple #8B5CF6` · `neon-magenta #D946EF` · `neon-emerald #10B981`
Base `#07090E` · surface `#0D111A` · line `#1E293B`
Text contrast vs base: hi 21:1, mid 14.3:1, low 8.9:1 (WCAG AAA).

## i18n

7 locales in `lib/i18n/`: `ar` (full RTL), `en`, `nl`, `de`, `tr`, `fr`, `es`.
Arabic has dedicated typography overrides (looser line-height, zero letter-spacing,
stepped-down weights). When adding UI copy, add the key to **all seven** locale files.

## Structure

```
app/[locale]/          home, quote, portal, admin
components/public/     hero + hero3d, services, portfolio, process
components/portal/     client portal
components/admin/      ERP dashboard + CMS
components/ui/         motion, aurora, primitives
lib/i18n/              7 locales
lib/supabase/          client.ts, server.ts, types.ts
lib/content-store.tsx  central store wiring CMS -> public site
supabase/schema.sql    tables + RLS policies
```

## Verification

Playwright browser downloads are blocked in some sandboxes. When you cannot use a
browser, verify by curling rendered HTML and grepping the compiled CSS for the
classes/keyframes you expect — silent non-emission is a real failure mode here
(see rules 5 and 6).

Do not leave placeholder comments such as `// سنكمل لاحقاً` in core sections.
