-- Staff actions in the enquiry CRM append audit events. Public clients remain
-- unable to create or read events.
grant insert on public.enquiry_events to authenticated;
create policy enquiry_events_staff_insert
  on public.enquiry_events
  for insert
  to authenticated
  with check (
    (select private.is_staff())
    and (actor_id is null or actor_id = (select auth.uid()))
  );
