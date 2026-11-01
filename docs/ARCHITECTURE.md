# Architecture

## Phase 1 foundation

- `src/app/` contains App Router routes and global design tokens.
- `src/components/layout/` contains the site-wide header and footer.
- `src/lib/` is reserved for validated environment configuration and shared utilities.
- `supabase/migrations/` will own all database schema changes; `supabase/seed.sql` will hold non-secret seed data.
- `types/` will contain generated Supabase TypeScript types.

The current home page is a static server component. Product catalog, forms, authentication and persistence are added in later phases. Public pages must read catalog content from Supabase when that integration is introduced; product data must not be embedded in UI components.

## Security boundaries

- Public Supabase URL and anonymous key may be used in browser-safe clients.
- Service-role credentials are server-only and must never be imported by client components.
- Validate environment variables and all inputs at server boundaries.
- Database access is governed by RLS policies in versioned SQL migrations.
- Enquiry records and uploads are private; public clients must not query enquiry data.

## Phase sequence

Database + RLS, public catalog, enquiry flow, admin, resources/growth, SEO/accessibility, then launch review. See the project brief for acceptance criteria.
