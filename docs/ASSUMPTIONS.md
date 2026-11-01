# Assumptions

## Owner questionnaire (Part B)

- Priority order is quote enquiries, dealer/distributor network, credibility, later online sales, then hiring, based on the numbered selections. The experience is quote-led; online checkout is disabled.
- A logo and brand colors exist but were not provided. Initial tokens use a provisional deep navy and aqua palette; replace them when the official values/assets arrive. No font preference was supplied; the foundation uses system sans-serif pending brand guidance.
- No inspiration sites were named. The tone is premium, clear and technically grounded.
- Only a Google Maps share link was supplied. Official email, phone, WhatsApp, business hours, resolved address and map embed are unverified.
- The company both manufactures and sources/trades. Specific in-house products, own-brand assignments and product claims need owner confirmation.
- Certifications, awards, client names/logos, testimonials, review permissions and case studies are unconfirmed and must not be published as verified content.
- “Many” locations is insufficient to assert nationwide service, shipping or exports. Service geography remains to confirm.
- Installation, AMC, maintenance, water testing, consultation, plant design and commissioning were not individually confirmed.
- The owner wants resources and calculators. Calculator outputs should be indicative and recommend expert consultation. Careers was not clearly selected and is excluded until confirmed.
- Admin access is invite-only for two or three staff. Their identities and role allocation remain to confirm.
- Existing product imagery, datasheets, brochures, videos and reviews were not supplied in the workspace; no asset availability is assumed.
- “hmwatertreatmentcomponents” does not clarify whether it is an owned domain, a brand name, or a hosting preference. Assume Vercel for deployment and retain hmaquachem.com only after domain ownership and redirects are confirmed.
- No extra must-haves or exclusions were supplied.

## Phase 1 implementation

- Use English, light mode, quote-led B2B positioning, and provisional navy/aqua brand tokens.
- Use Geist through `next/font` until brand typography is supplied.
- Use CSS-drawn water motifs in the foundation rather than unverified product photography.
- Do not publish contact details or certifications until verified.

## Phase 3 implementation

- Catalog categories and products are read from Supabase through the public anonymous client. Product rows remain inactive until the owner verifies them, so public listing and search pages intentionally show a verification state today.
- The six audience groups explicitly named in the brief (apartments/residential, hospitals, hotels, industrial/manufacturing, commercial buildings and institutions) are seeded as active industries. Their detailed copy remains generic until confirmed.
- No service offerings were confirmed. The Services page reads active service rows from Supabase and displays a confirmation message while none are active.
- A contact form and direct contact channels are deferred to the enquiry phase because official email, phone and WhatsApp details are unconfirmed. Quote links currently lead to the Contact page.

## Phase 4 implementation

- The quote list stores only public product identifiers, names, slugs and quantities in the visitor's browser local storage; it does not store contact details.
- Contact and quote submissions require at least one reply channel (email or phone), and both are optional individually.
- The public endpoint requires configured Supabase service credentials. Production submissions fail closed if Turnstile is not configured; local development may run without Turnstile.
- Email delivery is best-effort after the enquiry transaction commits. Missing or failed email configuration never discards the saved enquiry; delivery failures are logged without PII.
- Rate limiting allows five requests per IP hash per minute. The hash is HMAC-protected with `RATE_LIMIT_SECRET` or the service-role key and only the hash is retained for up to one day.

## Phase 6 implementation

- No article, FAQ, testimonial, client logo or download has been seeded as factual content. Public resource pages show clear empty states until staff publish approved content.
- The site renders a small safe Markdown subset for posts; raw HTML is displayed as text and never executed.
- Public product files require an active product and public document metadata, then use a short-lived signed URL.
- The approved calculator is limited to daily hardness load expressed as CaCO₃ equivalent. It makes no softener size, capacity, dosing or treatment recommendation because no design capacities or product dosing specs were supplied.
- Newsletter subscriptions use double opt-in, 24-hour confirmation links, hashed tokens, and explicit public-table privilege revocation. Newsletter campaign composition and delivery are not included; only subscriber collection and staff review are implemented.
- The public business listing and Part A disagree on company address/contact details. Structured data therefore includes only Organization and WebSite identity; LocalBusiness address/telephone details are withheld until the owner confirms them.
- Google Analytics is optional and loads only after explicit analytics consent. The selected analytics provider is GA4; leave `NEXT_PUBLIC_GA_MEASUREMENT_ID` blank to keep analytics and the consent prompt disabled.
