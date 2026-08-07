# LinkShort

> A full-stack authenticated URL shortener built with Next.js 16 App Router, Clerk, Drizzle ORM, and Neon PostgreSQL.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-1.0-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)](https://clerk.com)
[![Neon](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E5BF?logo=postgresql&logoColor=white)](https://neon.tech)
[![Zod](https://img.shields.io/badge/Validation-Zod-3E67B1)](https://zod.dev)

---

## Table of Contents

1. [Problem It Solves](#problem-it-solves)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Authentication Approach](#authentication-approach)
5. [Database Architecture](#database-architecture)
6. [CRUD Functionality](#crud-functionality)
7. [Redirect Flow](#redirect-flow)
8. [Security Decisions](#security-decisions)
9. [Testing](#testing)
10. [GitHub Copilot Usage](#github-copilot-usage)
11. [AI Outputs Reviewed or Changed](#ai-outputs-reviewed-or-changed)
12. [Repository & Agent Instructions](#repository--agent-instructions)
13. [Lessons Learned](#lessons-learned)
14. [Local Setup](#local-setup)

---

## Problem It Solves

Long URLs are unwieldy to share, and generic public shorteners offer no ownership — anyone can see or overwrite your links. LinkShort solves both problems:

- **Long URLs become short codes** — a random 6-character code or a custom slug you choose.
- **Every link is private to its owner** — only the authenticated user who created a link can view, edit, or delete it.
- **Redirects are privacy-respecting** — the `Referrer-Policy: no-referrer` header prevents the destination site from learning where visitors came from.
- **Zero-friction management** — a personal dashboard gives full CRUD control over your link collection without leaving the browser.

---

## Architecture Overview

```mermaid
flowchart TD
    Browser(["Browser"])
    Proxy["proxy.ts\n(Clerk Middleware)"]
    Clerk["Clerk Auth Service"]
    Home["/ — Landing Page"]
    Dashboard["/dashboard — Link Manager"]
    Actions["Server Actions\ncreateLink · updateLink · deleteLink"]
    DataLayer["data/links.ts\nDB query functions"]
    Redirect["/l/[shortcode]\nRoute Handler"]
    Drizzle["Drizzle ORM"]
    Neon[("Neon PostgreSQL")]

    Browser -->|All requests| Proxy
    Proxy -->|Unauthenticated /dashboard| Clerk
    Clerk -->|Sign-in redirect| Browser
    Proxy -->|Authenticated visitor on /| Dashboard
    Proxy --> Home
    Proxy --> Dashboard
    Proxy --> Redirect
    Dashboard -->|Mutations| Actions
    Actions --> DataLayer
    Redirect --> DataLayer
    DataLayer --> Drizzle
    Drizzle --> Neon
```

**Request paths:**

| Path | Who handles it | Auth required |
|---|---|---|
| `/` | Landing page (Server Component) | No — redirects authenticated users to `/dashboard` |
| `/dashboard` | Dashboard page + Server Actions | Yes — enforced by `proxy.ts` |
| `/l/[shortcode]` | Route handler, 302 redirect | No — public |
| `/__clerk/*` | Clerk internal proxy | Managed by Clerk |

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) App Router | 16.3.0 |
| UI Runtime | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Database | [Neon](https://neon.tech) serverless PostgreSQL | `@neondatabase/serverless` 1.1.0 |
| ORM | [Drizzle ORM](https://orm.drizzle.team) | 1.0.0-rc.4 |
| Migrations | Drizzle Kit | 1.0.0-rc.4 |
| Authentication | [Clerk](https://clerk.com) | `@clerk/nextjs` 7.6.3 |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 | 4.x |
| UI Primitives | shadcn/ui + Base UI | shadcn 4.16.0 |
| Validation | [Zod](https://zod.dev) | 4.4.3 |
| Icons | Lucide React | 1.28.0 |
| Linting | ESLint 9 + `eslint-config-next` | 9.x |
| Formatting | Prettier | 3.9.6 |

---

## Authentication Approach

Authentication is handled entirely by **Clerk** with a layered defence-in-depth strategy.

### Layer 1 — Middleware (proxy.ts)

`proxy.ts` acts as the Next.js middleware entry point (the project uses `proxy.ts` instead of `middleware.ts` per its Next.js 16 convention — see [Repository & Agent Instructions](#repository--agent-instructions)).

```
/dashboard  →  auth.protect()  →  Clerk sign-in if unauthenticated
/           →  userId present?  →  NextResponse.redirect("/dashboard")
```

This prevents any dashboard page or Server Action from running before Clerk has verified the session.

### Layer 2 — Server Action guards

Every Server Action independently calls `auth()` and exits early if `userId` is null:

```ts
const { userId } = await auth();
if (!userId) return { error: "Unauthorized" };
```

This is an explicit second check — even if `proxy.ts` is ever misconfigured, no mutation can proceed without a verified Clerk session.

### Layer 3 — Per-row data isolation

All database reads and writes include `eq(links.userId, userId)`, so a signed-in user can never access another user's records regardless of the link `id` they supply.

### UI state

`<ClerkProvider>` wraps the entire root layout. The navbar uses Clerk's `<Show when="signed-in/out">` components to render `<SignInButton>`, `<SignUpButton>` (both modal mode), or `<UserButton>` based on session state. The `<AuthRedirect>` client component provides a client-side push to `/dashboard` as a fallback for authenticated visitors on `/`.

---

## Database Architecture

### Schema

A single table stores all shortened links. `user_id` is a plain `text` column containing the Clerk user ID string — no FK constraint, because the users live in Clerk's managed infrastructure, not in this database.

| Column | Type | Constraints |
|---|---|---|
| `id` | `integer` | PRIMARY KEY, `GENERATED ALWAYS AS IDENTITY` |
| `short_code` | `varchar(20)` | NOT NULL, UNIQUE |
| `url` | `text` | NOT NULL |
| `user_id` | `text` | NOT NULL (Clerk user ID) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` |

```mermaid
erDiagram
    LINKS {
        integer id PK
        varchar_20 short_code UK
        text url
        text user_id
        timestamptz created_at
        timestamptz updated_at
    }
```

### Design decisions

- **Single table** — the app's data model is intentionally simple; joins and relations are not needed.
- **`GENERATED ALWAYS AS IDENTITY`** — uses the SQL standard identity column instead of `SERIAL`, which avoids sequence ownership pitfalls.
- **Neon serverless HTTP driver** (`drizzle-orm/neon-http`) — chosen over the WebSocket driver because the app runs on Vercel's serverless functions where persistent WebSocket connections are not available.
- **Drizzle Kit migrations** — schema changes are versioned as SQL in `drizzle/` and applied with `npx drizzle-kit push`.

---

## CRUD Functionality

### Data layer (`data/links.ts`)

| Function | SQL operation | Ownership check |
|---|---|---|
| `getUserLinks(userId)` | `SELECT ... ORDER BY updatedAt DESC` | `WHERE user_id = userId` |
| `createLinkForUser(userId, { url, customSlug? })` | `INSERT` | Sets `user_id = userId` |
| `updateLinkForUser(userId, id, { url, shortCode })` | `UPDATE` | `WHERE id = id AND user_id = userId` |
| `deleteLinkForUser(userId, id)` | `DELETE` | `WHERE id = id AND user_id = userId` |
| `getLinkByShortCode(shortCode)` | `SELECT` (public) | None — used by the redirect route only |

### Server Actions (`app/dashboard/actions.ts`)

All three actions are `"use server"` functions that share a two-step security preamble before touching the database:

1. `validateCsrfOrigin()` — compares the `origin` and `host` headers; throws `403` on mismatch.
2. `auth()` — returns `{ error: "Unauthorized" }` if Clerk has no session.

| Action | Zod Schema | On success |
|---|---|---|
| `createLink(input)` | `url` (valid URL, http/https only) + optional `customSlug` (3–20 chars, `[a-zA-Z0-9-_]+`) | Returns `{ success, data }`, calls `revalidatePath("/dashboard")` |
| `updateLink(input)` | `id` (positive int) + `url` + `shortCode` (required, same rules as slug) | Returns `{ success, data }`, calls `revalidatePath("/dashboard")` |
| `deleteLink(input)` | `id` (positive int) | Returns `{ success }`, calls `revalidatePath("/dashboard")` |

`revalidatePath("/dashboard")` after every mutation causes Next.js to re-fetch the dashboard Server Component on the next visit, keeping the link list always fresh without a manual refresh.

### Client-side interaction

Each dialog component (`CreateLinkDialog`, `EditLinkDialog`, `DeleteLinkDialog`) uses React's `useTransition` to call the Server Action, shows an inline loading/disabled state while the action is pending, and surfaces any returned error message inside the dialog.

---

## Redirect Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Proxy as proxy.ts
    participant Route as /l/[shortcode]
    participant DB as Neon PostgreSQL

    Browser->>Proxy: GET /l/abc123
    Proxy->>Route: passes through (no auth required)
    Route->>DB: SELECT url FROM links WHERE short_code = 'abc123'
    alt Short code found
        DB-->>Route: { url: "https://example.com/long-path" }
        Route-->>Browser: 302 Location: https://example.com/long-path
        Note over Route,Browser: Referrer-Policy: no-referrer
    else Short code not found
        DB-->>Route: empty result
        Route-->>Browser: 404 Not Found
    end
```

**Step-by-step:**

1. Browser requests `GET /l/abc123`.
2. `proxy.ts` matches the route but applies no auth protection — redirect URLs are public.
3. `app/l/[shortcode]/route.ts` reads `await params` (Next.js 16 async params API) to get the short code.
4. `getLinkByShortCode(shortcode)` runs a single `SELECT` against Neon.
5. If no row is found, `notFound()` triggers Next.js's 404 page.
6. If found, `NextResponse.redirect(link.url, { headers: { "Referrer-Policy": "no-referrer" } })` issues a 302 — the destination site receives no information about where the visitor came from.

---

## Security Decisions

| Decision | Where | Why |
|---|---|---|
| **CSRF origin check** | `validateCsrfOrigin()` in every Server Action | Prevents cross-origin forms from triggering mutations without a token |
| **URL protocol allowlist** | Zod: `protocol === "http:" \|\| "https:"` | Blocks `javascript:`, `data:`, and other dangerous schemes |
| **Slug character allowlist** | Zod: `/^[a-zA-Z0-9-_]+$/` | Prevents path traversal or injection via custom slugs |
| **Per-row ownership** | `and(eq(links.id, id), eq(links.userId, userId))` | IDOR-proof — users can never affect another user's data even with a valid session |
| **`Referrer-Policy: no-referrer`** | Redirect route response header | Destination sites cannot see LinkShort as the referrer |
| **`X-Frame-Options: DENY`** | `next.config.ts` headers | Blocks clickjacking via iframes |
| **`X-Content-Type-Options: nosniff`** | `next.config.ts` headers | Prevents MIME-type sniffing attacks |
| **HSTS (2 years)** | `Strict-Transport-Security` header | Forces HTTPS for all future requests including subdomains |
| **`Permissions-Policy`** | `next.config.ts` headers | Disables camera, microphone, and geolocation APIs |
| **Content Security Policy** | `next.config.ts` headers | `default-src 'self'`; scripts and connections whitelisted to Clerk domains only; `object-src 'none'` blocks plugin injection |
| **Safe external links** | All `<a target="_blank">` elements | `rel="noopener noreferrer"` prevents tab-napping |
| **Clerk middleware first** | `proxy.ts` + per-action guard | Two independent auth checks — middleware and action-level — so a misconfigured route matcher can't bypass auth |

---

## Testing

There is currently no automated test suite. Manual verification covers:

- **Auth flow** — sign up, sign in, sign out; confirm dashboard is inaccessible while signed out
- **CRUD** — create a link with auto-generated code; create with a custom slug; edit URL and slug; delete with confirmation
- **Redirect** — visit `/l/<shortcode>`; confirm 302 to the correct destination; confirm `no-referrer` header
- **404** — visit `/l/doesnotexist`; confirm Next.js 404 page
- **CSRF** — submit a Server Action from a different origin; confirm rejection
- **Duplicate slug** — attempt to create/update to an existing slug; confirm user-friendly error message

### Planned

| Tool | Scope |
|---|---|
| **Jest + `@testing-library/react`** | Unit tests for Zod schemas; unit tests for `data/links.ts` query functions against a test DB |
| **Playwright** | E2E tests: sign-up flow, full CRUD on the dashboard, redirect resolution, 404 behaviour |

---

## GitHub Copilot Usage

GitHub Copilot (in VS Code Agent mode) was used throughout the project. Representative contributions:

- **Database schema** — suggested the `GENERATED ALWAYS AS IDENTITY` pattern over `SERIAL`, and the `timestamptz` type for `created_at`/`updated_at`.
- **Zod schemas** — generated the initial `createLinkSchema` and `updateLinkSchema` definitions including the URL protocol refinement.
- **Server Action boilerplate** — scaffolded the `validateCsrfOrigin` utility and the shared auth-preamble pattern used across all three actions.
- **Security headers** — produced the initial `Content-Security-Policy` header string in `next.config.ts`.
- **`useTransition` pattern** — suggested using `useTransition` in dialog components to bridge client form state with Server Action calls.
- **Drizzle query composition** — proposed the `and(eq(...), eq(...))` pattern for ownership-scoped mutations.
- **`AGENTS.md`** — generated the initial structure and coding standards documentation.
- **`.github/instructions/`** — generated domain-specific instruction files for auth, data fetching, server actions, and UI.

---

## AI Outputs Reviewed or Changed

Not everything Copilot generated was used as-is. Key changes made during review:

| Output | What was changed | Why |
|---|---|---|
| CSP header | Narrowed `script-src` from `*` to explicit Clerk subdomains | Overly broad CSP negates the protection |
| Slug validation regex | Changed from `\w+` (allows Unicode word chars) to `[a-zA-Z0-9-_]+` | Ensures slugs are URL-safe ASCII only |
| CSRF check | Switched from a shared secret token approach to origin/host comparison | Token storage adds complexity; origin check is sufficient for same-site Server Actions |
| `deleteLinkForUser` | Added the `eq(links.userId, userId)` ownership clause that was missing from the initial suggestion | Without it, any authenticated user could delete any link by ID |
| Error messages | Replaced generic Zod `.message()` fallbacks with context-specific copy (e.g., "That slug is already taken") | Better UX for the most common failure cases |
| `proxy.ts` naming | Changed from default `middleware.ts` | Project convention for Next.js 16 — documented in `AGENTS.md` |

---

## Repository & Agent Instructions

This repository uses a structured agent instruction system to keep AI-assisted development consistent.

### `AGENTS.md` / `CLAUDE.md`

The root `AGENTS.md` is the single source of truth for project conventions and is consumed by any AI agent or LLM working on this codebase. `CLAUDE.md` simply references it via `@AGENTS.md`. Key rules:

- **TypeScript strict mode** — no `any` types.
- **`proxy.ts` over `middleware.ts`** — the project uses `proxy.ts` as the Next.js 16 middleware entry point. Never create or modify `middleware.ts`.
- **Server Components by default** — add `"use client"` only when browser APIs or React hooks are required.
- **`const` over `let`** — var is banned.
- **2-space indent, double quotes, semicolons** — consistent with the ESLint config.

### `.github/instructions/`

Four scoped instruction files that GitHub Copilot loads when working on matching files:

| File | Scope |
|---|---|
| `auth.instructions.md` | Authentication implementation rules |
| `data-fetching.instructions.md` | How to fetch data in Server Components and actions |
| `server-actions.instructions.md` | Server Action conventions (CSRF, auth, Zod, revalidation) |
| `ui.instructions.md` | UI component rules (shadcn/ui primitives, Tailwind v4 patterns) |

### Agent skills (`.agents/skills/`)

| Skill | Purpose |
|---|---|
| `monthly-links-chart` | Generates a bar chart PNG of link creation activity over the past 12 months |
| `skill-creator` | Creates, modifies, and evaluates agent skills |

---

## Lessons Learned

- **Next.js 16 async params** — Route handler params must be awaited (`await params`) rather than accessed synchronously. Accessing `params.shortcode` directly causes a runtime error in Next.js 16.
- **Clerk v7 `await auth()`** — Clerk's v7 `auth()` helper is async; calling it synchronously silently returns `null` for `userId`. Every Server Action must `await auth()`.
- **`proxy.ts` vs `middleware.ts`** — The project chose `proxy.ts` as the middleware filename per the Next.js 16 convention in `AGENTS.md`. This works because the `config.matcher` export is still respected regardless of the file name when configured appropriately. Document team conventions early to avoid confusion.
- **Neon serverless HTTP driver** — The `neon-http` driver is required on Vercel's serverless runtime; the WebSocket-based driver assumes a persistent connection that serverless functions don't maintain.
- **Zod v4 URL refinement** — `z.string().url()` alone accepts `ftp://` and other non-web schemes. A `.refine()` narrowing the protocol to `http:` or `https:` is needed to prevent users from shortening non-web URLs.
- **`revalidatePath` scope** — Passing only `"/dashboard"` to `revalidatePath` is sufficient; passing `"/"` would also invalidate the cached landing page unnecessarily.
- **Data isolation as a query concern** — Treating `userId` as a required query parameter (not just a filter) at the data-layer level makes IDOR impossible by construction rather than by convention.
- **Clerk's `shadcn` theme preset** — Passing `appearance={{ theme: shadcn }}` to `ClerkProvider` automatically aligns Clerk's modals with the project's Tailwind dark-mode design system without any manual CSS overrides.

---

## Local Setup

### Prerequisites

- **Node.js 18+** (`node --version`)
- A **[Neon](https://neon.tech)** PostgreSQL project (free tier works)
- A **[Clerk](https://clerk.com)** application (free tier works)

### Steps

#### 1. Clone and install dependencies

```bash
git clone https://github.com/emman2582/linkshortenerproject.git
cd linkshortenerproject
npm install
```

#### 2. Create `.env.local`

```env
# Clerk — https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon — https://console.neon.tech → your project → Connection Details
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → your app → **API Keys** |
| `CLERK_SECRET_KEY` | Clerk Dashboard → your app → **API Keys** |
| `DATABASE_URL` | Neon Console → your project → **Connection Details** → **Connection string** |

#### 3. Push the database schema

```bash
npx drizzle-kit push
```

This runs the migration in `drizzle/` against your Neon database, creating the `links` table.

#### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit push` | Push schema changes to the database |
| `npx drizzle-kit studio` | Open Drizzle Studio (visual DB browser) |

### Project structure

```
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout (ClerkProvider, navbar)
│   ├── globals.css               # Tailwind base styles
│   ├── dashboard/
│   │   ├── page.tsx              # Link management dashboard (Server Component)
│   │   └── actions.ts            # Server Actions: createLink / updateLink / deleteLink
│   └── l/[shortcode]/
│       └── route.ts              # Public redirect route handler
├── components/
│   ├── auth-redirect.tsx         # Client-side auth redirect for landing page
│   ├── create-link-dialog.tsx    # Create link modal
│   ├── edit-link-dialog.tsx      # Edit link modal
│   ├── delete-link-dialog.tsx    # Delete confirmation dialog
│   └── ui/                       # shadcn/ui primitives (Button, Card, Dialog, etc.)
├── data/
│   └── links.ts                  # Database query functions (data access layer)
├── db/
│   ├── schema.ts                 # Drizzle table definitions + exported types
│   └── index.ts                  # Neon + Drizzle client
├── drizzle/                      # Auto-generated migration files
├── proxy.ts                      # Next.js middleware (Clerk auth + redirect logic)
├── next.config.ts                # Security headers, CSP
└── AGENTS.md                     # AI agent instructions and project conventions
```
```

## Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint

npx drizzle-kit push    # Sync schema to database
npx drizzle-kit studio  # Open Drizzle Studio (DB GUI)
```

## Deployment

This project is optimized for [Vercel](https://vercel.com):

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add the three environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`) in **Project Settings → Environment Variables**
4. Deploy — Vercel handles the rest

> Make sure your Neon database allows connections from Vercel's IP ranges, or use the pooled connection string Neon provides.

## License

MIT
