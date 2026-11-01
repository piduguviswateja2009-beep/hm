# Architecture

## Phase 1 foundation

- `src/app/` contains App Router routes and global design tokens.
- `src/components/layout/` contains the site-wide header and footer.
- `src/lib/` is reserved for validated environment configuration and shared utilities.
- `supabase/migrations/` owns all database schema changes; `supabase/seed.sql` holds non-sensitive catalog seed data.
- `types/database.types.ts` is generated from the HM Aqua Chem Supabase project.

The HM Aqua Chem project is `bmkiqdzacbsjqcyyoeue` in `ap-south-1`. Phase 2 created the catalog, content, enquiry, CRM and settings tables. Every public table has RLS enabled. Catalog rows are read publicly only when active; enquiries, enquiry items, events and newsletter subscribers have no anonymous read or write path. Public forms will write through validated server routes using the server-only service role.

The current home page is a static server component. Product catalog, forms, authentication and persistence in public pages are added in later phases. Public pages must read catalog content from Supabase; product data must not be embedded in UI components.

## Security boundaries

- Public Supabase URL and anonymous key may be used in browser-safe clients.
- Service-role credentials are server-only and must never be imported by client components.
- Validate environment variables and all inputs at server boundaries.
- Database access is governed by RLS policies in versioned SQL migrations.
- Enquiry records and uploads are private; public clients must not query enquiry data.

## Phase sequence

Database + RLS, public catalog, enquiry flow, admin, resources/growth, SEO/accessibility, then launch review. See the project brief for acceptance criteria.
