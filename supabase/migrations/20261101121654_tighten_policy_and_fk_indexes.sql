-- Cover remaining foreign keys and make authenticated SELECT paths use one
-- policy per table/role, avoiding overlapping permissive policies.
create index enquiry_events_actor_idx on public.enquiry_events(actor_id);
create index enquiry_items_product_idx on public.enquiry_items(product_id);
create index posts_author_idx on public.posts(author_id);
create index testimonials_product_idx on public.testimonials(product_ref);

drop policy categories_public_read on public.categories;
drop policy categories_staff_manage on public.categories;
create policy categories_anon_read on public.categories
  for select to anon using (is_active and deleted_at is null);
create policy categories_authenticated_read on public.categories
  for select to authenticated using (
    (is_active and deleted_at is null) or (select private.is_staff())
  );
create policy categories_staff_insert on public.categories
  for insert to authenticated with check ((select private.is_staff()));
create policy categories_staff_update on public.categories
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy categories_staff_delete on public.categories
  for delete to authenticated using ((select private.is_staff()));

drop policy products_public_read on public.products;
drop policy products_staff_manage on public.products;
create policy products_anon_read on public.products
  for select to anon using (
    is_active and deleted_at is null and exists (
      select 1 from public.categories c
      where c.id = category_id and c.is_active and c.deleted_at is null
    )
  );
create policy products_authenticated_read on public.products
  for select to authenticated using (
    (is_active and deleted_at is null and exists (
      select 1 from public.categories c
      where c.id = category_id and c.is_active and c.deleted_at is null
    )) or (select private.is_staff())
  );
create policy products_staff_insert on public.products
  for insert to authenticated with check ((select private.is_staff()));
create policy products_staff_update on public.products
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy products_staff_delete on public.products
  for delete to authenticated using ((select private.is_staff()));

drop policy product_images_public_read on public.product_images;
drop policy product_images_staff_manage on public.product_images;
create policy product_images_anon_read on public.product_images
  for select to anon using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active and p.deleted_at is null)
  );
create policy product_images_authenticated_read on public.product_images
  for select to authenticated using (
    (exists (select 1 from public.products p where p.id = product_id and p.is_active and p.deleted_at is null))
    or (select private.is_staff())
  );
create policy product_images_staff_insert on public.product_images
  for insert to authenticated with check ((select private.is_staff()));
create policy product_images_staff_update on public.product_images
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy product_images_staff_delete on public.product_images
  for delete to authenticated using ((select private.is_staff()));

drop policy product_documents_public_read on public.product_documents;
drop policy product_documents_staff_manage on public.product_documents;
create policy product_documents_anon_read on public.product_documents
  for select to anon using (
    is_public and exists (select 1 from public.products p where p.id = product_id and p.is_active and p.deleted_at is null)
  );
create policy product_documents_authenticated_read on public.product_documents
  for select to authenticated using (
    (is_public and exists (select 1 from public.products p where p.id = product_id and p.is_active and p.deleted_at is null))
    or (select private.is_staff())
  );
create policy product_documents_staff_insert on public.product_documents
  for insert to authenticated with check ((select private.is_staff()));
create policy product_documents_staff_update on public.product_documents
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy product_documents_staff_delete on public.product_documents
  for delete to authenticated using ((select private.is_staff()));

drop policy industries_public_read on public.industries;
drop policy industries_staff_manage on public.industries;
create policy industries_anon_read on public.industries
  for select to anon using (is_active and deleted_at is null);
create policy industries_authenticated_read on public.industries
  for select to authenticated using ((is_active and deleted_at is null) or (select private.is_staff()));
create policy industries_staff_insert on public.industries
  for insert to authenticated with check ((select private.is_staff()));
create policy industries_staff_update on public.industries
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy industries_staff_delete on public.industries
  for delete to authenticated using ((select private.is_staff()));

drop policy services_public_read on public.services;
drop policy services_staff_manage on public.services;
create policy services_anon_read on public.services
  for select to anon using (is_active and deleted_at is null);
create policy services_authenticated_read on public.services
  for select to authenticated using ((is_active and deleted_at is null) or (select private.is_staff()));
create policy services_staff_insert on public.services
  for insert to authenticated with check ((select private.is_staff()));
create policy services_staff_update on public.services
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy services_staff_delete on public.services
  for delete to authenticated using ((select private.is_staff()));

drop policy posts_public_read on public.posts;
drop policy posts_staff_manage on public.posts;
create policy posts_anon_read on public.posts
  for select to anon using (status = 'published' and published_at <= now() and deleted_at is null);
create policy posts_authenticated_read on public.posts
  for select to authenticated using (
    (status = 'published' and published_at <= now() and deleted_at is null) or (select private.is_staff())
  );
create policy posts_staff_insert on public.posts
  for insert to authenticated with check ((select private.is_staff()));
create policy posts_staff_update on public.posts
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy posts_staff_delete on public.posts
  for delete to authenticated using ((select private.is_staff()));

drop policy faqs_public_read on public.faqs;
drop policy faqs_staff_manage on public.faqs;
create policy faqs_anon_read on public.faqs
  for select to anon using (is_active and deleted_at is null);
create policy faqs_authenticated_read on public.faqs
  for select to authenticated using ((is_active and deleted_at is null) or (select private.is_staff()));
create policy faqs_staff_insert on public.faqs
  for insert to authenticated with check ((select private.is_staff()));
create policy faqs_staff_update on public.faqs
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy faqs_staff_delete on public.faqs
  for delete to authenticated using ((select private.is_staff()));

drop policy testimonials_public_read on public.testimonials;
drop policy testimonials_staff_manage on public.testimonials;
create policy testimonials_anon_read on public.testimonials
  for select to anon using (is_published and deleted_at is null);
create policy testimonials_authenticated_read on public.testimonials
  for select to authenticated using ((is_published and deleted_at is null) or (select private.is_staff()));
create policy testimonials_staff_insert on public.testimonials
  for insert to authenticated with check ((select private.is_staff()));
create policy testimonials_staff_update on public.testimonials
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy testimonials_staff_delete on public.testimonials
  for delete to authenticated using ((select private.is_staff()));

drop policy clients_public_read on public.clients;
drop policy clients_staff_manage on public.clients;
create policy clients_anon_read on public.clients
  for select to anon using (is_published and deleted_at is null);
create policy clients_authenticated_read on public.clients
  for select to authenticated using ((is_published and deleted_at is null) or (select private.is_staff()));
create policy clients_staff_insert on public.clients
  for insert to authenticated with check ((select private.is_staff()));
create policy clients_staff_update on public.clients
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy clients_staff_delete on public.clients
  for delete to authenticated using ((select private.is_staff()));

drop policy site_settings_public_read on public.site_settings;
drop policy site_settings_staff_manage on public.site_settings;
create policy site_settings_anon_read on public.site_settings
  for select to anon using (is_public);
create policy site_settings_authenticated_read on public.site_settings
  for select to authenticated using (is_public or (select private.is_staff()));
create policy site_settings_staff_insert on public.site_settings
  for insert to authenticated with check ((select private.is_staff()));
create policy site_settings_staff_update on public.site_settings
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy site_settings_staff_delete on public.site_settings
  for delete to authenticated using ((select private.is_staff()));

drop policy public_media_read on storage.objects;
drop policy public_media_staff_manage on storage.objects;
create policy public_media_anon_read on storage.objects
  for select to anon using (bucket_id = 'public-media');
create policy public_media_authenticated_read on storage.objects
  for select to authenticated using (bucket_id = 'public-media');
create policy public_media_staff_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'public-media' and (select private.is_staff()));
create policy public_media_staff_update on storage.objects
  for update to authenticated using (bucket_id = 'public-media' and (select private.is_staff()))
  with check (bucket_id = 'public-media' and (select private.is_staff()));
create policy public_media_staff_delete on storage.objects
  for delete to authenticated using (bucket_id = 'public-media' and (select private.is_staff()));

drop policy public_documents_read on storage.objects;
drop policy documents_staff_manage on storage.objects;
create policy public_documents_anon_read on storage.objects
  for select to anon using (
    bucket_id = 'documents' and exists (
      select 1 from public.product_documents d
      join public.products p on p.id = d.product_id
      where d.storage_path = name and d.is_public and p.is_active and p.deleted_at is null
    )
  );
create policy public_documents_authenticated_read on storage.objects
  for select to authenticated using (
    bucket_id = 'documents' and (
      exists (
        select 1 from public.product_documents d
        join public.products p on p.id = d.product_id
        where d.storage_path = name and d.is_public and p.is_active and p.deleted_at is null
      ) or (select private.is_staff())
    )
  );
create policy documents_staff_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'documents' and (select private.is_staff()));
create policy documents_staff_update on storage.objects
  for update to authenticated using (bucket_id = 'documents' and (select private.is_staff()))
  with check (bucket_id = 'documents' and (select private.is_staff()));
create policy documents_staff_delete on storage.objects
  for delete to authenticated using (bucket_id = 'documents' and (select private.is_staff()));
