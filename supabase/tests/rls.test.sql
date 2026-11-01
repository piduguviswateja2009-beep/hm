-- Run with `supabase test db` against the local Supabase stack.
-- These checks verify anonymous reads/writes fail for sensitive tables/catalog.
begin;

-- Temporary fixtures make the read tests meaningful; the transaction rolls
-- them back after the anonymous checks.
insert into public.enquiries (type, name, message)
values ('contact', 'RLS test fixture', 'Temporary rollback-only fixture');
insert into public.newsletter_subscribers (email)
values ('rls-test@example.invalid');
insert into public.products (category_id, slug, name, is_active)
select id, 'rls-test-inactive', 'Temporary RLS fixture', false
from public.categories where slug = 'ro-antiscalants-chemicals';

set local role anon;

do $$
declare
  visible_rows bigint;
  changed_rows bigint;
begin
  begin
    execute 'select count(*) from public.enquiries' into visible_rows;
    if visible_rows <> 0 then
      raise exception 'RLS test failed: anon could read enquiries';
    end if;
  exception when insufficient_privilege then
    null;
  end;

  begin
    execute 'select count(*) from public.newsletter_subscribers' into visible_rows;
    if visible_rows <> 0 then
      raise exception 'RLS test failed: anon could read newsletter subscribers';
    end if;
  exception when insufficient_privilege then
    null;
  end;

  begin
    execute 'insert into public.products (category_id, slug, name) values (gen_random_uuid(), ''rls-test'', ''RLS Test'')';
    raise exception 'RLS test failed: anon could write catalog data';
  exception when insufficient_privilege then
    null;
  end;

  execute 'update public.products set name = ''Unauthorized update'' where slug = ''rls-test-inactive''' ;
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then
    raise exception 'RLS test failed: anon could update catalog data';
  end if;

  begin
    execute 'insert into public.enquiries (type, name, message) values (''contact'', ''RLS Test'', ''RLS Test'')';
    raise exception 'RLS test failed: anon could write enquiries directly';
  exception when insufficient_privilege then
    null;
  end;

  begin
    execute 'insert into public.newsletter_subscribers (email) values (''rls-test@example.invalid'')';
    raise exception 'RLS test failed: anon could write newsletter subscribers directly';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

rollback;
