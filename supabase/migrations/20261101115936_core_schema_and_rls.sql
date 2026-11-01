-- HM Aqua Chem catalog and enquiry foundation.
-- Public submissions are written only through validated server routes using
-- the service role; the anon role receives no write access to these tables.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.set_updated_at() from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.is_active
      and p.role in ('admin', 'editor')
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.is_active
      and p.role = 'admin'
  );
$$;

revoke all on function private.is_staff() from public, anon;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.is_admin() to authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  short_description text,
  description text,
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  applications jsonb not null default '[]'::jsonb check (jsonb_typeof(applications) = 'array'),
  specs jsonb not null default '{}'::jsonb check (jsonb_typeof(specs) = 'object'),
  packaging_options jsonb not null default '[]'::jsonb check (jsonb_typeof(packaging_options) = 'array'),
  brand text,
  model text,
  price_visible boolean not null default false,
  price_inr numeric(12,2) check (price_inr is null or price_inr >= 0),
  price_unit text,
  is_featured boolean not null default false,
  is_active boolean not null default false,
  seo_title text,
  seo_description text,
  search_vector tsvector generated always as (
    to_tsvector('english'::regconfig,
      coalesce(name, '') || ' ' || coalesce(short_description, '') || ' ' ||
      coalesce(description, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(model, '')
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint products_hide_price_by_default check (price_visible or price_inr is null)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  type text not null check (type in ('datasheet', 'msds', 'brochure', 'certificate')),
  storage_path text not null unique,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  description text,
  hero_image text,
  content text,
  is_active boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  description text,
  content text,
  is_active boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image text,
  author_id uuid references public.profiles(id) on delete set null,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  search_vector tsvector generated always as (
    to_tsvector('english'::regconfig,
      coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint published_posts_have_date check (status <> 'published' or published_at is not null)
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  sort_order integer not null default 0,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  location text,
  rating smallint check (rating between 1 and 5),
  quote text not null,
  product_ref uuid references public.products(id) on delete set null,
  source text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact', 'quote', 'dealer', 'callback')),
  name text not null,
  company text,
  email text,
  phone text,
  city text,
  message text not null,
  source_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiry_items (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity numeric(12,3) check (quantity is null or quantity > 0),
  unit text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiry_events (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event text not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and email = trim(email)),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_parent_idx on public.categories(parent_id);
create index products_category_active_idx on public.products(category_id, is_active) where deleted_at is null;
create index products_search_idx on public.products using gin(search_vector);
create index product_images_product_order_idx on public.product_images(product_id, sort_order);
create index product_documents_product_idx on public.product_documents(product_id);
create index industries_active_idx on public.industries(is_active) where deleted_at is null;
create index services_active_idx on public.services(is_active) where deleted_at is null;
create index posts_search_idx on public.posts using gin(search_vector);
create index posts_published_idx on public.posts(published_at desc) where status = 'published' and deleted_at is null;
create index faqs_active_order_idx on public.faqs(is_active, sort_order) where deleted_at is null;
create index testimonials_published_idx on public.testimonials(is_published) where deleted_at is null;
create index clients_published_idx on public.clients(is_published) where deleted_at is null;
create index enquiries_status_created_idx on public.enquiries(status, created_at desc);
create index enquiries_assigned_created_idx on public.enquiries(assigned_to, created_at desc);
create index enquiry_items_enquiry_idx on public.enquiry_items(enquiry_id);
create index enquiry_events_enquiry_created_idx on public.enquiry_events(enquiry_id, created_at desc);
create index newsletter_subscribers_created_idx on public.newsletter_subscribers(created_at desc);

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger product_documents_set_updated_at before update on public.product_documents for each row execute function public.set_updated_at();
create trigger industries_set_updated_at before update on public.industries for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();
create trigger faqs_set_updated_at before update on public.faqs for each row execute function public.set_updated_at();
create trigger testimonials_set_updated_at before update on public.testimonials for each row execute function public.set_updated_at();
create trigger clients_set_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger enquiries_set_updated_at before update on public.enquiries for each row execute function public.set_updated_at();
create trigger enquiry_items_set_updated_at before update on public.enquiry_items for each row execute function public.set_updated_at();
create trigger newsletter_subscribers_set_updated_at before update on public.newsletter_subscribers for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_documents enable row level security;
alter table public.industries enable row level security;
alter table public.services enable row level security;
alter table public.posts enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;
alter table public.clients enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_items enable row level security;
alter table public.enquiry_events enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.site_settings enable row level security;

grant select on public.profiles to authenticated;
grant insert, update on public.profiles to authenticated;
create policy profiles_read_self_or_admin on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select private.is_admin()));
create policy profiles_admin_insert on public.profiles
  for insert to authenticated with check ((select private.is_admin()));
create policy profiles_admin_update on public.profiles
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

grant select on public.categories, public.products, public.product_images, public.product_documents,
  public.industries, public.services, public.posts, public.faqs, public.testimonials, public.clients,
  public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images,
  public.product_documents, public.industries, public.services, public.posts, public.faqs,
  public.testimonials, public.clients, public.site_settings to authenticated;

create policy categories_public_read on public.categories
  for select to anon, authenticated using (is_active and deleted_at is null);
create policy categories_staff_manage on public.categories
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create policy products_public_read on public.products
  for select to anon, authenticated using (
    is_active and deleted_at is null and exists (
      select 1 from public.categories c
      where c.id = category_id and c.is_active and c.deleted_at is null
    )
  );
create policy products_staff_manage on public.products
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create policy product_images_public_read on public.product_images
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active and p.deleted_at is null)
  );
create policy product_images_staff_manage on public.product_images
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create policy product_documents_public_read on public.product_documents
  for select to anon, authenticated using (
    is_public and exists (select 1 from public.products p where p.id = product_id and p.is_active and p.deleted_at is null)
  );
create policy product_documents_staff_manage on public.product_documents
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create policy industries_public_read on public.industries
  for select to anon, authenticated using (is_active and deleted_at is null);
create policy industries_staff_manage on public.industries
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy services_public_read on public.services
  for select to anon, authenticated using (is_active and deleted_at is null);
create policy services_staff_manage on public.services
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create policy posts_public_read on public.posts
  for select to anon, authenticated using (
    status = 'published' and published_at <= now() and deleted_at is null
  );
create policy posts_staff_manage on public.posts
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create policy faqs_public_read on public.faqs
  for select to anon, authenticated using (is_active and deleted_at is null);
create policy faqs_staff_manage on public.faqs
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy testimonials_public_read on public.testimonials
  for select to anon, authenticated using (is_published and deleted_at is null);
create policy testimonials_staff_manage on public.testimonials
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy clients_public_read on public.clients
  for select to anon, authenticated using (is_published and deleted_at is null);
create policy clients_staff_manage on public.clients
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create policy enquiries_staff_read on public.enquiries
  for select to authenticated using ((select private.is_staff()));
create policy enquiries_staff_update on public.enquiries
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy enquiry_items_staff_read on public.enquiry_items
  for select to authenticated using ((select private.is_staff()));
create policy enquiry_events_staff_read on public.enquiry_events
  for select to authenticated using ((select private.is_staff()));
create policy newsletter_staff_read on public.newsletter_subscribers
  for select to authenticated using ((select private.is_staff()));

create policy site_settings_public_read on public.site_settings
  for select to anon, authenticated using (is_public);
create policy site_settings_staff_manage on public.site_settings
  for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

grant select, update on public.enquiries to authenticated;
grant select on public.enquiry_items, public.enquiry_events, public.newsletter_subscribers to authenticated;

create or replace function public.search_products(search_query text, max_results integer default 20)
returns table (
  id uuid,
  slug text,
  name text,
  short_description text,
  category_slug text,
  rank real
)
language sql
stable
security invoker
set search_path = ''
as $$
  select p.id, p.slug, p.name, p.short_description, c.slug,
    ts_rank(p.search_vector, websearch_to_tsquery('english', search_query))
  from public.products p
  join public.categories c on c.id = p.category_id
  where p.is_active and p.deleted_at is null and c.is_active and c.deleted_at is null
    and p.search_vector @@ websearch_to_tsquery('english', search_query)
  order by 6 desc, p.name
  limit greatest(1, least(coalesce(max_results, 20), 50));
$$;
revoke all on function public.search_products(text, integer) from public;
grant execute on function public.search_products(text, integer) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('documents', 'documents', false, 10485760, array['application/pdf']),
  ('private-uploads', 'private-uploads', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy public_media_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'public-media');
create policy public_media_staff_manage on storage.objects
  for all to authenticated using (bucket_id = 'public-media' and (select private.is_staff()))
  with check (bucket_id = 'public-media' and (select private.is_staff()));
create policy public_documents_read on storage.objects
  for select to anon, authenticated using (
    bucket_id = 'documents' and exists (
      select 1 from public.product_documents d
      join public.products p on p.id = d.product_id
      where d.storage_path = name and d.is_public and p.is_active and p.deleted_at is null
    )
  );
create policy documents_staff_manage on storage.objects
  for all to authenticated using (bucket_id = 'documents' and (select private.is_staff()))
  with check (bucket_id = 'documents' and (select private.is_staff()));
create policy private_uploads_staff_manage on storage.objects
  for all to authenticated using (bucket_id = 'private-uploads' and (select private.is_staff()))
  with check (bucket_id = 'private-uploads' and (select private.is_staff()));

comment on table public.enquiries is 'Contains personal information. Access only through validated server routes and staff CRM policies; establish a retention schedule before launch.';
comment on column public.site_settings.is_public is 'Only explicitly public settings may be read by anonymous clients. Never store secrets here.';
