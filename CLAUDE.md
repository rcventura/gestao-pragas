# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (also regenerates `AGENTS.md`, see above).
- `npm run build` — production build.
- `npm run start` — run a production build.
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript).

There is no test suite yet — `docs/arquitetura.md` names Vitest/Playwright as the intended tools, but neither is configured or scripted in `package.json`. Don't assume `npm test` exists. There is also no database-migration script — applying migrations is manual, via the Supabase CLI.

## Stack

- Next.js 16.3.4 (App Router), React 19.2.8, strict TypeScript 5.
- Tailwind CSS v4 (`@tailwindcss/postcss`), earthy palette (`#1b2823`, `#f4f1eb`, `#b45432`), icons via `lucide-react`.
- Supabase: `@supabase/supabase-js` + `@supabase/ssr` for Auth, Postgres, and RLS. No ORM — schema is plain SQL under `supabase/migrations/`.
- Import alias `@/*` → `src/*`.
- ESLint 9 flat config (`eslint.config.mjs`, `eslint-config-next`); no Prettier/Biome.
- **Not yet installed** despite being named as planned in `docs/arquitetura.md`: Zod (validation today is manual in server actions), Vitest, Playwright.

## Architecture

This is a Next.js 16 (App Router) + React 19 + TypeScript SaaS for a pest-control company: an admin panel for the service company plus a client portal (a technician area is still only planned). Styling is Tailwind CSS 4. All auth and data live in Supabase (Auth, Postgres, RLS, Storage). Full domain vision is in `docs/arquitetura.md` (Portuguese); note that document describes the target design — e.g. `tecnico` and `cliente` roles and a module layout under `src/modules/` are planned but not yet implemented in code.

### Route/module structure

- `src/app/` — routes: `login/` (with a `login/admin/` submode), `forgot-password/`, `reset-password/`, `auth/callback/`, `dashboard/` (`clients/`, `clients/new/`, `clients/[id]/edit/`), `portal/` (still a stub).
- `src/app/actions/` — `"use server"` server actions, one file per domain (`auth.ts`, `clients.ts`).
- `src/lib/auth/authorization.ts` — `requireRole()` and `getSafeRedirectPath()` (see Auth and authorization below).
- `src/lib/supabase/` — `server.ts` (SSR client via cookies), `browser.ts` (client-side client), `proxy.ts` (session refresh used by the proxy/middleware).
- `src/proxy.ts` — the Next proxy (see `middleware.ts` → `proxy.ts` below), intercepting `/login`, `/dashboard`, `/portal`.
- Naming convention: kebab-case; a page's client component sits next to it (`login-form.tsx` next to `page.tsx`).

### `middleware.ts` → `proxy.ts`

This Next.js version renamed middleware to "proxy" (see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). The root file is [src/proxy.ts](src/proxy.ts), exporting `proxy()` (not `middleware()`), matched against `/login`, `/dashboard`, `/portal`. It delegates to [src/lib/supabase/proxy.ts](src/lib/supabase/proxy.ts)'s `updateSession`, which refreshes the Supabase session cookie and redirects unauthenticated users away from protected routes. Don't recreate a `middleware.ts` from training-data habit.

### "Clients" in the UI are `organizations` rows in the DB

The admin UI calls tenant companies "clientes" (`src/app/dashboard/clients/**`), but the underlying table is `organizations`. A `profiles` row links a Supabase Auth user to one `organization_id` plus a `role`. Keep this mapping in mind when tracing a UI flow into the database.

### Current domain model

Implemented (`supabase/migrations/*.sql`):

- `organizations` — the tenant company: name, slug, email, `active`, `client_type`, document, address, `deactivation_reason`/`deactivated_at`.
- `profiles` — 1:1 with `auth.users`; `role` enum `super_admin`/`admin`/`operator`; `organization_id` (null only for `super_admin`).
- `organization_status_history` — audit trail of activation/deactivation.
- Security-definer RPCs: `update_organization_for_admin`, `deactivate_organization_for_admin`, `activate_organization_for_admin`, `get_organization_for_admin`, `get_organization_status_history`; helpers `is_super_admin()`, `current_organization_id()`, `is_organization_admin()`.
- Sensitive mutations only go through RPCs; GRANTs restrict direct column-level `select`.

**Divergence from the product doc:** `docs/arquitetura.md` describes `admin/operador/tecnico/cliente` roles, but the code today uses `super_admin/admin/operator`. Not yet modeled: end clients (an `organization` is not the same as an end client), service locations, service orders, scheduling, technicians, products.

### Auth and authorization

- Three Supabase client factories, pick the right one: [src/lib/supabase/server.ts](src/lib/supabase/server.ts) (Server Components/Actions, cookie-based), [src/lib/supabase/browser.ts](src/lib/supabase/browser.ts) (Client Components), [src/lib/supabase/proxy.ts](src/lib/supabase/proxy.ts) (proxy only).
- [src/lib/auth/authorization.ts](src/lib/auth/authorization.ts) exports `requireRole(roles, loginPath?)`, the standard guard: it loads the Supabase user, joins `profiles` for `role`/`organization_id`/`active`, and redirects if the user is missing, inactive, or not in `roles`. Every protected Server Component page calls this first (see [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx), [src/app/dashboard/clients/page.tsx](src/app/dashboard/clients/page.tsx)).
- `AppRole` currently is only `"super_admin" | "admin" | "operator"` — the `tecnico`/`cliente` roles from `docs/arquitetura.md` aren't wired up (e.g. `/portal` today gates on `["admin", "operator"]` as a placeholder, not on a real client role).
- `getSafeRedirectPath` in the same file allow-lists post-login redirect targets (`/dashboard`, `/portal`, `/reset-password`) to prevent open redirects — extend that allow-list rather than validating redirects ad hoc elsewhere.
- Login has two modes (`admin` vs `client`) handled by one `signIn` action in [src/app/actions/auth.ts](src/app/actions/auth.ts), which checks the resulting `profiles.role` against the requested mode and signs the user back out if it doesn't match.

### Server actions and mutations

Actions live in `src/app/actions/*.ts` (`"use server"`), always start by calling `requireRole`. A typical action validates input → calls a Supabase RPC for privileged writes → `redirect()`s with a success/error message in the query string, consumed by `client-toast.tsx`. Two mutation patterns coexist, both illustrated in [src/app/actions/clients.ts](src/app/actions/clients.ts):

- Plain inserts/selects go directly through the Supabase client (`supabase.from(...)`), relying on RLS/column grants.
- Anything more sensitive than an insert (update, deactivate, activate, etc.) goes through a Postgres RPC with `security definer`, defined in `supabase/migrations/` (e.g. `update_organization_for_admin`, `deactivate_organization_for_admin`, `activate_organization_for_admin`). When adding this kind of mutation, add a matching migration + RPC rather than issuing a direct table update from the app.

Data reads happen directly via Supabase in Server Components — there are no route handlers for that.

### Row-level security and migrations

`supabase/migrations/*.sql` is the source of truth for schema, RLS policies, and grants — check it before assuming a table/column/function exists. The pattern used throughout is explicit: `revoke ... from anon, authenticated` followed by `grant select (col1, col2, ...) on table ... to authenticated`, plus `security definer` functions (search_path pinned, execute revoked from public/anon/authenticated, granted only to the role that needs it) for anything privileged — see [supabase/migrations/202609080003_harden_data_access_and_audit.sql](supabase/migrations/202609080003_harden_data_access_and_audit.sql). Follow this column-level, deny-by-default style for new tables/columns instead of relying on table-level RLS alone.

### Environment variables (`.env.example`)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`. `VERCEL_URL` is also used as a fallback in `src/app/actions/auth.ts` but isn't listed in `.env.example`.

### Existing repo agent configs

This repo already defines other agent configs worth reading if you need more domain/security detail than above: [.agent.md](.agent.md) (general project agent: multi-tenant/RLS conventions, delivery expectations), [.github/agents/security-performance-auditor.agent.md](.github/agents/security-performance-auditor.agent.md) (read-only security/performance audit checklist for this stack), and [.claude/agents/security-tester.md](.claude/agents/security-tester.md) (active security-testing agent: exercises RLS, security-definer RPCs, auth, and tenant isolation with read-only SQL/HTTP checks against a real environment, never writing real data).
