alter table public.newsletter_subscribers
  add column confirmation_token_hash text,
  add column confirmation_expires_at timestamptz,
  add column unsubscribe_token_hash text;

alter table public.newsletter_subscribers
  add constraint newsletter_confirmation_hash_format
    check (confirmation_token_hash is null or confirmation_token_hash ~ '^[0-9a-f]{64}$'),
  add constraint newsletter_unsubscribe_hash_format
    check (unsubscribe_token_hash is null or unsubscribe_token_hash ~ '^[0-9a-f]{64}$');

create unique index newsletter_confirmation_hash_unique
  on public.newsletter_subscribers (confirmation_token_hash)
  where confirmation_token_hash is not null;

create unique index newsletter_unsubscribe_hash_unique
  on public.newsletter_subscribers (unsubscribe_token_hash)
  where unsubscribe_token_hash is not null;

comment on column public.newsletter_subscribers.confirmation_token_hash is
  'SHA-256 hash of a single-use confirmation token; raw token is emailed and never stored.';
comment on column public.newsletter_subscribers.unsubscribe_token_hash is
  'SHA-256 hash of a single-use unsubscribe token; raw token is emailed and never stored.';
