-- Verify public visitors cannot reach the private rate-limit state or the
-- service-role-only submission RPCs. This test makes no data changes.
begin;
do $$
begin
  if has_table_privilege('anon', 'private.public_rate_limits', 'select') then
    raise exception 'anon can read private rate limits';
  end if;
  if has_table_privilege('anon', 'private.public_rate_limits', 'insert') then
    raise exception 'anon can write private rate limits';
  end if;
  if has_table_privilege('authenticated', 'private.public_rate_limits', 'select') then
    raise exception 'authenticated clients can read private rate limits';
  end if;
  if has_function_privilege('anon', 'public.consume_public_rate_limit(text,timestamptz,integer)', 'execute') then
    raise exception 'anon can execute rate limiter';
  end if;
  if has_function_privilege('anon', 'public.create_public_enquiry(text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb)', 'execute') then
    raise exception 'anon can execute enquiry writer';
  end if;
  if has_function_privilege('authenticated', 'public.create_public_enquiry(text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb)', 'execute') then
    raise exception 'authenticated clients can execute public enquiry writer directly';
  end if;
  if not has_function_privilege('service_role', 'public.consume_public_rate_limit(text,timestamptz,integer)', 'execute') then
    raise exception 'service_role cannot execute rate limiter';
  end if;
  if not has_function_privilege('service_role', 'public.create_public_enquiry(text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb)', 'execute') then
    raise exception 'service_role cannot execute enquiry writer';
  end if;
end
$$;
rollback;
