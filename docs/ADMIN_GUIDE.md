# HM Aqua Chem admin guide

## Sign in and staff access

The dashboard is at `/admin`. There is no public registration page. An owner should invite each staff member from Supabase Authentication, then create or activate that person's `public.profiles` row with the same Auth user UUID, a display name, and a role (`admin` or `editor`). Set `is_active` to `true` only after the account is approved. Password reset and account disabling are managed in Supabase Auth; set `profiles.is_active` to `false` to immediately block dashboard access at the next request.

Do not share the Supabase service-role key with staff. Staff use their own invited accounts and the dashboard's user-scoped Supabase client. Keep the initial account creation restricted to the owner. An `admin` and an `editor` can manage catalog and site content; user invitations and role assignment remain owner-managed in Supabase.

## Enquiries

Open **Enquiries** to filter by status or search within the latest 100 enquiries returned for the selected status. Expand a record to review contact details and message, assign an active staff profile, update its status, or add internal notes. **Export CSV** downloads up to 5,000 newest enquiries and includes contact details and internal notes; store the file securely and delete it when no longer needed.

Status changes are recorded in `enquiry_events`. Use notes for internal follow-up only; they are not sent to the customer. Respond to the customer using the email or phone shown in their enquiry. Email notifications from the website are best-effort and should not replace checking the CRM.

## Catalog and product files

Create a category before creating a product. New products are inactive by default; review all product facts before publishing. Product prices remain hidden. For each product, maintain a unique lowercase slug, concise copy, features/applications (one per line), packaging options (one per line), and a valid JSON object for specifications. Never enter unverified claims, certifications, performance figures, or prices.

Add descriptive alt text before uploading an image. Images must be JPEG, PNG, WebP, or AVIF and no larger than 5 MB. Product documents must be PDF and no larger than 10 MB. Documents are private by default; enable public download only for approved files. Publishing a product does not make private documents public.

## Content and site settings

Posts accept Markdown and remain drafts until published. Review links, product claims, spelling, and permission before publication. FAQs, testimonials, client names/logos, and site settings should only be published after the owner approves their accuracy and usage rights. Do not put secrets, passwords, or personal data in site settings.

Archiving hides content from the public site while preserving its database record. Confirm before archiving a live product, post, category, FAQ, testimonial, or client entry.

## Newsletter

The **Newsletter** screen is a staff-only view of addresses and their confirmation/unsubscribe status. Visitors must confirm by email before being subscribed. Subscribers can unsubscribe from a confirmation page reached from the email; crawler prefetching the link does not unsubscribe them. Newsletter delivery campaigns are not part of this release.

## Owner setup checklist

- Configure the environment variables listed in `.env.example` in the deployment environment.
- Invite 2–3 named staff through Supabase Auth and provision their `profiles` rows.
- Keep at least one owner-controlled `admin` account active.
- Verify the sender and team recipient addresses before enabling enquiry emails.
- Confirm products, documents, contact channels, legal copy, and public testimonials before publishing.
