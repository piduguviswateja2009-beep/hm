-- Safe, non-sensitive catalog bootstrap. All seeded products remain inactive
-- until an owner/editor verifies claims, specifications, documents and images.

insert into public.categories (slug, name, description, sort_order, is_active) values
  ('ro-antiscalants-chemicals', 'RO Antiscalants & Chemicals', 'RO antiscalant and water treatment chemical enquiries.', 10, true),
  ('membrane-cleaning-chemicals', 'Membrane Cleaning Chemicals', 'Membrane cleaning chemical enquiries.', 20, true),
  ('water-softeners', 'Water Softeners', 'Water softening equipment and system enquiries.', 30, true),
  ('ro-plants', 'RO Plants & Control Panels', 'Reverse osmosis plant and control panel enquiries.', 40, true),
  ('ro-membranes', 'RO Membranes', 'Reverse osmosis membrane enquiries.', 50, true),
  ('filtration', 'Filtration', 'Water filtration component and plant enquiries.', 60, true),
  ('water-treatment-components', 'Water Treatment Components', 'Water treatment plant and purifier component enquiries.', 70, true),
  ('anodes', 'Anodes', 'Anode enquiries for water treatment applications.', 80, true),
  ('zld-water-reuse', 'ZLD & Water Reuse', 'Zero liquid discharge and water reuse enquiries.', 90, true)
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, brand, model, is_active) values
  ((select id from public.categories where slug = 'ro-antiscalants-chemicals'), 'hm-5010-active-ro-antiscalant', 'HM 5010 Active RO Antiscalant', 'HM', 'HM 5010', false),
  ((select id from public.categories where slug = 'ro-antiscalants-chemicals'), 'hm-5020-active-ro-antiscalant', 'HM 5020 Active RO Antiscalant', 'HM', 'HM 5020', false),
  ((select id from public.categories where slug = 'ro-antiscalants-chemicals'), 'hm-5030-active-ro-antiscalant', 'HM 5030 Active RO Antiscalant', 'HM', 'HM 5030', false),
  ((select id from public.categories where slug = 'ro-antiscalants-chemicals'), 'antiscalant-and-ph-booster', 'Antiscalant and pH Booster', null, null, false),
  ((select id from public.categories where slug = 'ro-antiscalants-chemicals'), 'hmb-14-ph-booster', 'HMB 14 pH Booster', 'HM', 'HMB 14', false),
  ((select id from public.categories where slug = 'membrane-cleaning-chemicals'), 'hm-c-02-membrane-cleaning-chemical', 'HM-C 02 Membrane Cleaning Chemical', 'HM', 'HM-C 02', false),
  ((select id from public.categories where slug = 'membrane-cleaning-chemicals'), 'membrane-treatment-cleaning-chemical', 'Membrane Treatment Cleaning Chemical', null, null, false),
  ((select id from public.categories where slug = 'water-softeners'), 'hm-scalenor', 'HM Scalenor Water Softener', 'HM', 'HM Scalenor', false),
  ((select id from public.categories where slug = 'water-softeners'), 'catalytic-water-softener', 'Catalytic Water Softener', null, null, false),
  ((select id from public.categories where slug = 'water-softeners'), 'ion-exchange-water-softening-systems', 'Ion Exchange Water Softening Systems', null, null, false),
  ((select id from public.categories where slug = 'ro-plants'), 'industrial-ro-plant-stainless-steel', 'Industrial RO Plant (stainless steel)', null, null, false),
  ((select id from public.categories where slug = 'ro-plants'), 'frp-ro-plant', 'FRP RO Plant', null, null, false),
  ((select id from public.categories where slug = 'ro-plants'), 'ro-control-panel', 'RO Control Panel', null, null, false),
  ((select id from public.categories where slug = 'ro-membranes'), 'ro-membrane', 'RO Membrane', null, null, false),
  ((select id from public.categories where slug = 'filtration'), 'jumbo-wound-sediment-filter-cartridge', 'Jumbo Wound / Sediment Filter Cartridge', null, null, false),
  ((select id from public.categories where slug = 'filtration'), 'water-filtration-plant', 'Water Filtration Plant', null, null, false),
  ((select id from public.categories where slug = 'water-treatment-components'), 'water-treatment-plant-components', 'Water Treatment Plant & Purifier Components', null, null, false),
  ((select id from public.categories where slug = 'anodes'), 'titanium-anode-electro-chlorinator', 'Titanium Anode for Electro-chlorinator', null, null, false),
  ((select id from public.categories where slug = 'anodes'), 'cathodic-protection-anode', 'Cathodic Protection Anode', null, null, false)
on conflict (slug) do nothing;

insert into public.services (slug, name, is_active) values
  ('zld-water-reuse-solutions', 'Zero Liquid Discharge / Water Reuse Solutions', false)
on conflict (slug) do nothing;

insert into public.industries (slug, name, is_active) values
  ('apartments-residential', 'Apartments & Residential', true),
  ('hospitals', 'Hospitals', true),
  ('hotels', 'Hotels', true),
  ('industrial-manufacturing', 'Industrial & Manufacturing', true),
  ('commercial-buildings', 'Commercial Buildings', true),
  ('institutions', 'Institutions', true)
on conflict (slug) do nothing;
