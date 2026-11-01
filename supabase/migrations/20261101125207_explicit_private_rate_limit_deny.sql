-- Make the private rate-limit table's client denial explicit as well as
-- relying on RLS's default-deny behavior and revoked table privileges.
create policy public_rate_limits_deny_clients
  on private.public_rate_limits
  for all
  to public
  using (false)
  with check (false);

comment on table private.public_rate_limits is
  'Server-only hashed IP rate-limit counters. Client roles are denied by grants and an explicit false RLS policy.';
