# Launch checklist

## Owner inputs

- [ ] Provide approved logo, brand colors, fonts and product imagery.
- [ ] Confirm public contact details, business hours, address and map pin.
- [ ] Confirm the canonical domain, DNS access and required old-URL redirects.
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
