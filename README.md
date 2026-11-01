# HM Aqua Chem

Premium, quote-led catalog and enquiry website for HM Water Components Pvt. Ltd. Built with Next.js App Router, TypeScript, Tailwind CSS and Supabase.

## Requirements

- Node.js 20.9 or later
- pnpm 9 or later

## Run locally

```bash
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

The site runs at `http://localhost:3000`. Public catalog pages can render without Supabase settings, but enquiry submission needs the server-side Supabase key. In production, configure both Turnstile keys so the form can pass the spam check.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Environment variables

Copy `.env.example` to `.env.local` and configure values as the corresponding integrations are implemented. `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` and `RATE_LIMIT_SECRET` are server-only. Never expose them to browser code or commit secrets.

For quote/contact enquiries, configure the Supabase URL, service-role key, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `ENQUIRY_TEAM_EMAIL`, and `ENQUIRY_FROM_EMAIL`. The sender must be verified with Resend before email delivery works. If email is unavailable, the database write still succeeds and the server records a generic delivery error without logging enquiry details.

## Supabase database

The HM Aqua Chem Supabase project is in `ap-south-1` with project ref `bmkiqdzacbsjqcyyoeue`. Database changes are versioned in `supabase/migrations/`; safe catalog seed data is in `supabase/seed.sql`. The seeded products remain inactive until their claims and details are owner-verified.

To link the Supabase CLI after authenticating, run:

```bash
pnpm supabase login
pnpm supabase link --project-ref bmkiqdzacbsjqcyyoeue
```

Regenerate database types after a schema change with:

```bash
pnpm supabase gen types typescript --project-id bmkiqdzacbsjqcyyoeue --schema public > types/database.types.ts
```

Run database RLS tests against a local Supabase stack with Docker available:

```bash
pnpm supabase start
pnpm supabase test db
```

## Deployment

Deploy the Git repository to Vercel after environment variables and domain ownership are confirmed. See `docs/LAUNCH_CHECKLIST.md` for operational steps.

## Project documents

- [Architecture](docs/ARCHITECTURE.md)
- [Assumptions](docs/ASSUMPTIONS.md)
- [Content to confirm](docs/CONTENT_TODO.md)
- [Admin guide](docs/ADMIN_GUIDE.md)
- [Launch checklist](docs/LAUNCH_CHECKLIST.md)
