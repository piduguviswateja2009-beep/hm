-- Public form submissions use a service-only RPC so enquiry rows and product
-- selections are written in one transaction. Rate-limit counters never leave
-- the private schema.

create table private.public_rate_limits (
  key_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (key_hash, window_start)
);

alter table private.public_rate_limits enable row level security;
revoke all on table private.public_rate_limits from public, anon, authenticated;
grant usage on schema private to service_role;

create or replace function public.consume_public_rate_limit(
  p_key_hash text,
  p_window_start timestamptz,
  p_limit integer default 5
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  if length(p_key_hash) < 32 or p_limit < 1 or p_limit > 100 then
    raise exception 'Invalid rate limit request';
  end if;

  insert into private.public_rate_limits (key_hash, window_start, request_count)
  values (p_key_hash, p_window_start, 1)
  on conflict (key_hash, window_start)
  do update set request_count = private.public_rate_limits.request_count + 1
  returning request_count into current_count;

  delete from private.public_rate_limits
  where window_start < now() - interval '1 day';

  return current_count <= p_limit;
end;
$$;
revoke all on function public.consume_public_rate_limit(text, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.consume_public_rate_limit(text, timestamptz, integer) to service_role;

create or replace function public.create_public_enquiry(
  p_type text,
  p_name text,
  p_company text,
  p_email text,
  p_phone text,
  p_city text,
  p_message text,
  p_source_page text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_utm_term text,
  p_utm_content text,
  p_items jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_id uuid;
  item jsonb;
  item_product_id uuid;
  item_quantity numeric;
begin
  if p_type not in ('contact', 'quote') then
    raise exception 'Invalid enquiry type';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 50 then
    raise exception 'Invalid enquiry items';
  end if;

  insert into public.enquiries (
    type, name, company, email, phone, city, message, source_page,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content
  ) values (
    p_type, p_name, nullif(p_company, ''), nullif(p_email, ''), nullif(p_phone, ''),
    nullif(p_city, ''), p_message, p_source_page, p_utm_source, p_utm_medium,
    p_utm_campaign, p_utm_term, p_utm_content
  ) returning id into created_id;

  for item in select value from jsonb_array_elements(p_items)
  loop
    item_product_id := (item ->> 'product_id')::uuid;
    item_quantity := nullif(item ->> 'quantity', '')::numeric;
    if not exists (
      select 1 from public.products p
      where p.id = item_product_id and p.is_active and p.deleted_at is null
    ) then
      raise exception 'One or more selected products are unavailable';
    end if;
    if item_quantity is not null and (item_quantity <= 0 or item_quantity > 100000) then
      raise exception 'Invalid enquiry quantity';
    end if;
    insert into public.enquiry_items (enquiry_id, product_id, quantity, unit, note)
    values (created_id, item_product_id, item_quantity, nullif(item ->> 'unit', ''), nullif(item ->> 'note', ''));
  end loop;

  insert into public.enquiry_events (enquiry_id, event, note)
  values (created_id, 'created', 'Public enquiry submitted');

  return created_id;
end;
$$;
revoke all on function public.create_public_enquiry(text, text, text, text, text, text, text, text, text, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_public_enquiry(text, text, text, text, text, text, text, text, text, text, text, text, text, jsonb) to service_role;
