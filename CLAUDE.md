@AGENTS.md

# Gestão de Pragas

SaaS para gestão de ordens de serviço de controle de pragas: painel administrativo para a empresa prestadora + portal do cliente (área do técnico ainda planejada). Arquitetura de monólito modular, multi-tenant, orientada a domínios. Visão de produto completa em `docs/arquitetura.md` — este arquivo cobre o estado real do código.

## Stack

- Next.js 16.3.4 (App Router), React 19.2.8, TypeScript 5 estrito
- Tailwind CSS v4 (`@tailwindcss/postcss`), paleta terrosa (`#1b2823`, `#f4f1eb`, `#b45432`), ícones via `lucide-react`
- Supabase: `@supabase/supabase-js` + `@supabase/ssr` para Auth, Postgres e RLS. Sem ORM — schema em SQL puro sob `supabase/migrations/`
- Alias de import `@/*` → `src/*`
- ESLint 9 flat config (`eslint.config.mjs`, `eslint-config-next`); sem Prettier/Biome
- **Ainda não instalados** apesar de citados em `docs/arquitetura.md` como planejados: Zod (validação hoje é manual nas server actions), Vitest, Playwright — não há nenhum teste no repo

## Estrutura

- `src/app/` — rotas: `login/` (com submodo `login/admin/`), `forgot-password/`, `reset-password/`, `auth/callback/`, `dashboard/` (`clients/`, `clients/new/`, `clients/[id]/edit/`), `portal/` (ainda stub)
- `src/app/actions/` — server actions `"use server"`, um arquivo por domínio (`auth.ts`, `clients.ts`)
- `src/lib/auth/authorization.ts` — `requireRole()` (guarda de papel/sessão, usada no início de toda página protegida) e `getSafeRedirectPath()` (proteção contra open redirect)
- `src/lib/supabase/` — `server.ts` (cliente SSR via cookies), `browser.ts` (cliente client-side), `proxy.ts` (refresh de sessão usado pelo middleware)
- `src/proxy.ts` — middleware do Next (nesta versão renomeado de `middleware.ts` para `proxy.ts` — ver aviso em AGENTS.md sobre breaking changes do Next), intercepta `/login`, `/dashboard`, `/portal`
- Convenção de nomes: kebab-case; componente cliente colocado ao lado da página (`login-form.tsx` perto de `page.tsx`)

## Modelo de domínio atual

Implementado (`supabase/migrations/*.sql`):
- `organizations` — cliente-empresa: nome, slug, email, `active`, `client_type`, documento, endereço, `deactivation_reason`/`deactivated_at`
- `profiles` — 1:1 com `auth.users`; `role` enum `super_admin`/`admin`/`operator`; `organization_id` (nulo só para super_admin)
- `organization_status_history` — auditoria de ativação/desativação
- RPCs security-definer: `update_organization_for_admin`, `deactivate_organization_for_admin`, `activate_organization_for_admin`, `get_organization_for_admin`, `get_organization_status_history`; helpers `is_super_admin()`, `current_organization_id()`, `is_organization_admin()`
- Mutações sensíveis só via RPC; GRANTs restringem select direto por coluna

**Divergência com a doc de produto:** `docs/arquitetura.md` descreve papéis `admin/operador/tecnico/cliente`, mas o código hoje usa `super_admin/admin/operator`. Ainda não modelados: clientes finais (organization ≠ cliente final), locais de atendimento, ordens de serviço, agenda, técnicos, produtos.

## Convenções de código

- Server action típica: valida entrada → chama RPC do Supabase para escrita privilegiada → `redirect()` com mensagem de sucesso/erro na query string, consumida por `client-toast.tsx`
- Toda página do dashboard começa com `const { supabase, user, ... } = await requireRole([...])`
- Leitura de dados é feita direto via Supabase em Server Components — não há route handlers para isso

## Variáveis de ambiente (`.env.example`)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`. `VERCEL_URL` também é usado como fallback em `src/app/actions/auth.ts` mas não está listado no `.env.example`.

## Scripts

`npm run dev|build|start|lint`. Não há scripts de teste ou de migração de banco — aplicação de migrations é manual/via Supabase CLI.
