# LinkShort

> A fast, full-stack URL shortener with user authentication, custom slugs, and a personal link dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?logo=drizzle)](https://orm.drizzle.team)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)](https://clerk.com)

<!-- Add a screenshot or demo GIF here -->
<!-- ![Dashboard screenshot](public/screenshot.png) -->

## Features

- **Shorten any URL** — Generates a 6-character alphanumeric short code instantly
- **Custom slugs** — Define your own short code (3–20 chars, letters, numbers, `-` and `_`)
- **Link dashboard** — View, edit, and delete all your links in one place
- **Secure authentication** — Sign up / sign in via Clerk; every link is private to its owner
- **Fast redirects** — `GET /l/[shortcode]` resolves and redirects with no-referrer privacy headers
- **Type-safe throughout** — Zod validation on all inputs, Drizzle ORM for the database layer

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Database | PostgreSQL via [Neon](https://neon.tech) serverless |
| ORM | Drizzle ORM + Drizzle Kit |
| Auth | [Clerk](https://clerk.com) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Validation | Zod |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Clerk](https://clerk.com) application

### 1. Clone and install

```bash
git clone https://github.com/emman2582/linkshortenerproject.git
cd linkshortenerproject
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Clerk — https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Neon — https://console.neon.tech → your project → Connection string
DATABASE_URL=postgresql://...
```

### 3. Push the database schema

```bash
npx drizzle-kit push
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout (ClerkProvider)
│   ├── dashboard/
│   │   ├── page.tsx              # Link management dashboard
│   │   └── actions.ts            # Server actions: create / update / delete
│   └── l/[shortcode]/
│       └── route.ts              # Redirect handler
├── components/
│   ├── create-link-dialog.tsx
│   ├── edit-link-dialog.tsx
│   ├── delete-link-dialog.tsx
│   └── ui/                       # shadcn/ui primitives
├── data/
│   └── links.ts                  # Database query functions
├── db/
│   ├── schema.ts                 # Drizzle table definitions
│   └── index.ts                  # DB client
└── drizzle/                      # Migration files
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
