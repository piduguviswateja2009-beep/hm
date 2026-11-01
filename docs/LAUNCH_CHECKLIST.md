# Launch checklist

## Owner inputs

- [ ] Provide approved logo, brand colors, fonts and product imagery.
- [ ] Confirm public contact details, business hours, address and map pin.
- [ ] Confirm the canonical domain, DNS access and required old-URL redirects.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the verified production canonical URL (no trailing slash); test sitemap, robots and canonical metadata.
- [ ] Resolve the public address/contact discrepancy and substantiate any public operating statistics before adding LocalBusiness metadata or marketing claims.
- [ ] Verify all catalog details, claims, documents and product availability.
- [ ] Approve legal copy, data retention and enquiry contact process.
- [ ] Nominate invite-only admin users and notification recipients.

## Operations (complete in later phases)

- [x] Create the HM Aqua Chem Supabase project in `ap-south-1`; apply the committed migrations and safe seed data.
- [ ] Disable public Auth sign-up; invite the approved initial admin users and provision their matching active `profiles` rows.
- [ ] Configure production environment variables in Vercel; verify service role secret is server-side only.
- [ ] Configure transactional email, sender-domain authentication and Turnstile.
- [ ] Configure analytics and consent settings if enabled.
- [ ] Point verified domain DNS to Vercel and validate HTTPS/canonical redirects.
- [ ] Run security, RLS, form, accessibility, mobile and production smoke checks.
- [ ] Confirm backup, enquiry retention and data deletion procedure.
- [ ] Configure and test newsletter confirmation email delivery; confirm privacy language and retention before inviting subscriptions.
- [ ] Publish only owner-reviewed articles, FAQs, testimonials, client logos, downloadable files and product information.

## Production setup runbook

### 1. Confirm production inputs

- [ ] Resolve every open item in `CONTENT_TODO.md`; especially choose the canonical domain and confirm one authoritative address, phone, email, hours, and privacy contact.
- [ ] Approve the privacy, cookie, and terms copy, including retention and deletion handling.
- [ ] Do not publish seeded catalog entries until product claims, specifications, documents, and images are owner-reviewed and activated.
- [ ] Choose the admin emails and enquiry team inbox. Confirm the sender domain is controlled by HM Water Components Pvt. Ltd.

### 2. Configure Vercel

1. In Vercel, import `piduguviswateja2009-beep/hm` and select `main` as the production branch. Keep the Next.js root at the repository root and use the detected pnpm build settings.
2. Add the variables from `.env.example` under Project Settings → Environment Variables. Set production and preview values separately. Required for production submissions: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, one publishable/anon Supabase key, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_SECRET`, `RESEND_API_KEY`, `ENQUIRY_TEAM_EMAIL`, and `ENQUIRY_FROM_EMAIL`.
3. Set `NEXT_PUBLIC_SITE_URL` to the final canonical HTTPS origin (no trailing slash) before the production build. Keep the Supabase service-role key and Turnstile secret server-only; never prefix them with `NEXT_PUBLIC_`.
4. Deploy a preview first. Verify a blank/incorrect secret does not get bundled by inspecting the browser network/source and checking the deployment environment. Promote only after the staging checks below pass.

### 3. Configure Supabase and staff

1. Confirm the HM project reference is `bmkiqdzacbsjqcyyoeue` and region is `ap-south-1`. Review the migration history before applying any pending migrations; use the committed files in `supabase/migrations/` via Supabase CLI, never dashboard schema edits.
2. Run `pnpm supabase test db` against a local Supabase stack or approved staging database. Review the anon/authenticated RLS denials and storage policies.
3. Disable public Auth sign-ups. Invite only the owner-approved admins, require strong unique passwords and enable MFA where available. Provision matching active `profiles` rows using the documented admin procedure.
4. Confirm buckets and file limits/policies match the migrations. Keep private uploads private; do not share service-role credentials with staff.

### 4. Configure email and spam protection

- [ ] Verify the Resend sender domain and publish the exact SPF/DKIM records Resend provides at the authoritative DNS provider. Add DMARC according to the owner’s email policy; do not overwrite existing mail records.
- [ ] Verify the sender address and team recipient. Send a staging enquiry and confirm the team notification and customer auto-reply.
- [ ] Create a Turnstile widget for the production and preview hostnames, then set its public site key and server secret in matching Vercel environments.
- [ ] Submit invalid/missing Turnstile tokens and verify they are rejected. Confirm repeated submissions are rate-limited without logging names, email, phone, or message content.

### 5. Connect the domain and DNS

1. Add the owner-confirmed domain(s) in Vercel Project Settings → Domains. Decide whether `hmaquachem.com` or `www.hmaquachem.com` is canonical; add the other as an alias/redirect according to Vercel’s domain configuration.
2. At the domain registrar/DNS provider, add only the records Vercel currently displays for that exact domain and project. DNS targets can change; do not copy record values from old notes. Preserve MX and existing email verification records.
3. Wait for Vercel to report the domain as verified and HTTPS as ready. Check apex and `www` from a clean browser and confirm one canonical origin, a valid certificate, no redirect loop, and no mixed content.
4. Update `NEXT_PUBLIC_SITE_URL` to that canonical HTTPS origin and redeploy. Check the homepage canonical, `sitemap.xml`, `robots.txt`, Open Graph URLs, and the legacy `/water-treatment-plants/` redirect.

### 6. Staging and production smoke checks

- [ ] Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, and `pnpm build` on the release revision; require the GitHub Actions `validate` check to pass.
- [ ] At 360px, 768px, 1280px and 1920px, check navigation, catalog/search, product details, enquiry list, contact form, footer, and cookie controls. Test keyboard-only navigation, focus visibility, labels, contrast, and reduced motion.
- [ ] Browse the catalog as a signed-out visitor. Confirm only active products and public documents appear and prices remain hidden.
- [ ] Submit one owner-approved staging enquiry with a test inbox. Verify the database row/items/audit event, CRM visibility, team email, auto-reply, and failure-safe behavior if email is unavailable. Remove test PII after the owner confirms the retention method.
- [ ] Test the invite-only admin login, role rejection, product draft/edit/publish, image/document upload, enquiry status update, CSV export, and logout using approved test accounts.
- [ ] Confirm analytics requests are absent before consent, appear only after acceptance when a GA4 ID is configured, and stop after rejection/revocation.
- [ ] Check browser console, Vercel runtime logs, security headers, CSP, sitemap/robots, custom 404/error page, and no exposed secrets or PII.

## Security review checklist

- [ ] RLS is enabled on every public schema table; anonymous users cannot read enquiries, items, events, newsletter subscribers, or private uploads and cannot write catalog/content tables.
- [ ] Only `service_role` can invoke the public enquiry writer/rate-limit RPC; `service_role` is server-only and absent from client bundles/source maps.
- [ ] Admin has no public sign-up path; server checks verify Supabase claims plus active `profiles` role before every protected view/action. Editors cannot perform admin-only operations.
- [ ] Enquiry/newsletter routes enforce same-origin, body size limits, Zod validation, honeypot, Turnstile, rate limiting, and generic errors; logs contain no submitted PII.
- [ ] Private files are accessed only with short-lived signed URLs. Validate type and size limits and confirm private buckets are not public.
- [ ] Verify CSP, HSTS, frame/content-type/referrer/permissions headers on production HTTPS. Review third-party scripts against CSP before enabling them.
- [ ] Review dependency/CI alerts, Supabase security advisories, Vercel environment access, admin membership, and key rotation ownership.
- [ ] Confirm backup schedule, restore test, incident contact, retention schedule, and process to fulfill access/correction/deletion requests.

## Remaining manual actions

Repository checks cannot configure owner accounts, secret values, domain/DNS, legal approvals, product truth, email deliverability, backups, or production consent/analytics behavior. Those items require the owner and relevant service dashboards before launch.
