-- P&G Beauty curated production seed
-- Run schema.sql, then seed.sql, then this file in Supabase SQL Editor.
-- This file uses real brand/product/category names and never creates passwords.
-- It preserves profiles with an admin role and wipes all other public business data.
-- Run only when a full data reset is intended.

begin;

update public.profiles
set role = 'Super Admin'
where lower(email) = lower('bukopandan3216@gmail.com');

delete from public.payments;
delete from public.order_items;
delete from public.orders;
delete from public.cart_items;
delete from public.wishlist_items;
delete from public.inventory_movements;
delete from public.purchase_order_items;
delete from public.purchase_orders;
delete from public.supplier_products;
delete from public.inventory;
delete from public.product_variants;
delete from public.products;
delete from public.recommendation_rules;
delete from public.suppliers;
delete from public.categories;
delete from public.brands;
delete from public.profiles
where role not in ('Super Admin', 'Beauty Admin', 'Beauty Staff')
  and lower(coalesce(email, '')) <> lower('bukopandan3216@gmail.com');

insert into public.profiles (id, full_name, email, role)
select
  auth_user.id,
  coalesce(nullif(auth_user.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(auth_user.email, ''), '@', 1)),
  auth_user.email,
  case when existing.role is not null then existing.role else 'Customer' end
from auth.users auth_user
left join public.profiles existing on existing.id = auth_user.id
where existing.role in ('Super Admin', 'Beauty Admin', 'Beauty Staff')
  or lower(auth_user.email) = lower('bukopandan3216@gmail.com')
on conflict (id) do update set email = excluded.email;

update public.profiles
set role = 'Super Admin'
where lower(email) = lower('bukopandan3216@gmail.com');

insert into public.brands (name, description) values
  ('Olay', 'Dermatologist-tested facial skincare and anti-aging care'),
  ('Pantene', 'Hair care, repair, and moisture products'),
  ('Head & Shoulders', 'Scalp care and anti-dandruff hair products'),
  ('Secret', 'Antiperspirant and deodorant products'),
  ('Ivory', 'Gentle body cleansing and moisturizing products'),
  ('Gillette', 'Men''s shaving and grooming products'),
  ('Oral-B', 'Electric and manual oral care products'),
  ('Crest', 'Toothpaste, whitening, and oral hygiene products'),
  ('Always', 'Menstrual and feminine care products'),
  ('Tampax', 'Tampons and period care products'),
  ('Old Spice', 'Men''s deodorant, body wash, and grooming products'),
  ('SK-II', 'Premium facial treatment skincare')
on conflict (name) do update set description = excluded.description;

insert into public.categories (name, description, image) values
  ('Skin Care', 'Moisturizers, serums, cleansers, and treatments', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=400&fit=crop&auto=format'),
  ('Hair Care', 'Shampoo, conditioner, masks, and scalp treatments', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&auto=format'),
  ('Body Care', 'Body wash, lotion, cream, and deodorant', 'https://images.unsplash.com/photo-1585232350009-d608de6e5f50?w=600&h=400&fit=crop&auto=format'),
  ('Oral Care', 'Toothpaste, brushes, floss, and whitening', 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&h=400&fit=crop&auto=format'),
  ('Personal Care', 'Shaving, feminine care, and daily essentials', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&auto=format')
on conflict (name) do update set description = excluded.description, image = excluded.image;

with catalog(brand, category, name, description, price, original_price, tags, rating, reviews, badge) as (
  values
  ('Olay','Skin Care','Regenerist Micro-Sculpting Cream','Amino-peptide moisturizer that firms skin and reduces the appearance of fine lines.',28.99,34.99,'{moisturizer,anti-aging,face cream}',4.7,2341,'Best Seller'),
  ('Olay','Skin Care','Regenerist Retinol 24 Night Face Moisturizer','Fragrance-free night moisturizer with retinol, vitamin B3, and peptides.',31.99,36.99,'{retinol,night cream,anti-aging}',4.6,1874,null),
  ('Olay','Skin Care','Vitamin C Brightening Serum','Vitamin C and niacinamide serum for a brighter, more even-looking complexion.',22.49,null,'{serum,vitamin c,brightening}',4.6,1489,null),
  ('Olay','Skin Care','Hyaluronic + Peptide 24 Eye Gel','Hydrating eye gel with hyaluronic acid and peptides.',24.99,29.99,'{eye care,hydration,peptides}',4.5,923,'New'),
  ('Olay','Skin Care','Gentle Foaming Cleanser','Creamy foaming cleanser that removes dirt and makeup without over-drying.',10.99,null,'{cleanser,gentle,sensitive}',4.5,3120,null),
  ('SK-II','Skin Care','Facial Treatment Essence','Fermented Pitera essence for smoother and more radiant-looking skin.',179.00,199.00,'{essence,pitera,premium}',4.8,812,'Premium'),
  ('SK-II','Skin Care','GenOptics Ultraura Essence','Brightening essence formulated for luminous-looking skin.',189.00,null,'{essence,brightening,premium}',4.7,364,null),
  ('Pantene','Hair Care','Pro-V Moisture Boost Shampoo','Pro-Vitamin B5 shampoo for soft, moisturized hair.',12.49,null,'{shampoo,moisture,haircare}',4.5,8732,'Best Seller'),
  ('Pantene','Hair Care','Pro-V Moisture Boost Conditioner','Daily conditioner that helps smooth and moisturize dry hair.',12.49,null,'{conditioner,moisture,haircare}',4.5,4210,null),
  ('Pantene','Hair Care','Miracle Rescue Deep Conditioner','Deep conditioning treatment for visibly damaged hair.',14.99,17.99,'{treatment,repair,deep conditioning}',4.6,2890,'Sale'),
  ('Pantene','Hair Care','Gold Series Moisture Boost Shampoo','Moisturizing shampoo designed for textured and curly hair.',13.99,null,'{shampoo,curly hair,moisture}',4.6,1973,null),
  ('Pantene','Hair Care','Pro-V Total Damage Care 5 Shampoo','Strengthening shampoo for five signs of damage.',11.99,null,'{shampoo,repair,damage care}',4.4,3501,null),
  ('Head & Shoulders','Hair Care','Classic Clean 2-in-1 Shampoo','Shampoo and conditioner with anti-dandruff protection.',9.99,null,'{shampoo,dandruff,2-in-1}',4.5,10234,'Best Seller'),
  ('Head & Shoulders','Hair Care','Clinical Strength Itch Relief Shampoo','Clinical-strength scalp care for itch and dandruff.',14.49,null,'{scalp care,dandruff,clinical}',4.4,3456,'Almost Sold Out'),
  ('Head & Shoulders','Hair Care','Royal Oils Moisture Boost Shampoo','Moisture-focused scalp and hair care for textured hair.',11.49,null,'{scalp care,moisture,textured hair}',4.5,1290,null),
  ('Secret','Personal Care','Clinical Strength Antiperspirant Powder Fresh','48-hour sweat and odor protection with a powder scent.',11.99,null,'{deodorant,antiperspirant,powder}',4.8,12504,'Best Seller'),
  ('Secret','Personal Care','Aluminum Free Deodorant Coconut & Cocoa Butter','Aluminum-free deodorant with a warm coconut scent.',8.99,null,'{deodorant,aluminum free,coconut}',4.3,1248,null),
  ('Old Spice','Personal Care','Swagger Antiperspirant Deodorant','Long-lasting odor protection with a classic fresh scent.',8.49,9.99,'{deodorant,antiperspirant,men}',4.7,9871,'Sale'),
  ('Old Spice','Body Care','Fiji with Coconut Oil Body Wash','Cleansing body wash with coconut and tropical fragrance notes.',7.99,null,'{body wash,coconut,men}',4.6,6120,null),
  ('Ivory','Body Care','Gentle Original Body Wash','Simple gentle body wash for everyday cleansing.',6.49,null,'{body wash,gentle,sensitive}',4.3,2850,null),
  ('Ivory','Body Care','Ultra Rich Shea Butter Body Wash','Rich body wash with shea butter for dry skin.',7.49,8.49,'{body wash,shea butter,dry skin}',4.4,1920,'Sale'),
  ('Gillette','Personal Care','Fusion5 ProGlide Razor','Flexing razor with five anti-friction blades.',18.99,22.99,'{shaving,razor,grooming}',4.7,8042,'Best Seller'),
  ('Gillette','Personal Care','SkinGuard Sensitive Razor','Sensitive-skin razor designed to reduce irritation.',16.49,null,'{shaving,sensitive skin,grooming}',4.5,2951,null),
  ('Gillette','Personal Care','Series Sensitive Shave Gel','Lubricating shave gel for sensitive skin.',6.99,null,'{shaving,sensitive skin,shave gel}',4.5,1465,null),
  ('Oral-B','Oral Care','Pro 1000 Rechargeable Electric Toothbrush','Rechargeable electric toothbrush with pressure sensor and timer.',39.99,49.99,'{toothbrush,electric,oral care}',4.7,5632,'Best Seller'),
  ('Oral-B','Oral Care','CrossAction Replacement Brush Heads','Replacement heads with angled bristles for plaque removal.',24.99,null,'{toothbrush,replacement heads,oral care}',4.6,4201,null),
  ('Oral-B','Oral Care','Glide Pro-Health Deep Clean Floss','Comfortable floss for deep cleaning between teeth.',5.99,null,'{floss,oral care,dental}',4.5,1870,null),
  ('Crest','Oral Care','3D White Advanced Whitening Toothpaste','Whitening toothpaste for surface stain removal.',7.99,9.49,'{toothpaste,whitening,oral care}',4.6,7402,'Sale'),
  ('Crest','Oral Care','Pro-Health Gum Detoxify Toothpaste','Toothpaste for gum health and deep cleaning.',8.49,null,'{toothpaste,gum care,oral care}',4.5,3012,null),
  ('Crest','Oral Care','3D White Whitestrips Professional Effects','At-home whitening strips for visibly whiter teeth.',44.99,49.99,'{whitening,teeth,oral care}',4.4,4980,'Premium'),
  ('Always','Personal Care','Infinity FlexFoam Size 2 Pads','Thin menstrual pads with flexible absorbent protection.',8.99,null,'{feminine care,pads,period}',4.6,8012,'Best Seller'),
  ('Always','Personal Care','Pure Cotton FlexFoam Size 2 Pads','Cottony soft period pads with flexible protection.',9.49,null,'{feminine care,cotton,pads}',4.5,3260,null),
  ('Always','Personal Care','Discreet Boutique Liners','Everyday pantiliners designed for comfort and discretion.',5.49,null,'{feminine care,liners,daily care}',4.4,2198,null),
  ('Tampax','Personal Care','Pearl Regular Tampons','Applicator tampons with leak protection for regular flow.',8.99,null,'{feminine care,tampons,period}',4.6,4560,'Best Seller'),
  ('Tampax','Personal Care','Pure Cotton Super Tampons','Cotton tampons with applicator for heavier flow days.',9.99,null,'{feminine care,tampons,cotton}',4.5,2210,null),
  ('Pantene','Hair Care','Pro-V Curl Perfection Conditioner','Conditioner for defined, soft curls and frizz control.',13.49,null,'{conditioner,curls,frizz control}',4.5,1840,null),
  ('Olay','Skin Care','Ultra Moisture Body Wash','Moisturizing body wash with shea butter.',8.49,null,'{body wash,moisture,shea butter}',4.4,2480,null),
  ('Secret','Personal Care','Coconut Splash Invisible Solid','Invisible solid antiperspirant with coconut fragrance.',7.49,null,'{deodorant,antiperspirant,coconut}',4.5,1940,null),
  ('Gillette','Personal Care','Mach3 Sensitive Razor','Three-blade razor with lubrication for sensitive skin.',13.99,null,'{shaving,razor,sensitive skin}',4.5,3210,null),
  ('Oral-B','Oral Care','Pro-Flex Stain Eraser Manual Toothbrush','Manual toothbrush designed for stain removal.',5.49,null,'{toothbrush,manual,oral care}',4.3,980,null),
  ('Crest','Oral Care','Cavity Protection Toothpaste','Everyday fluoride toothpaste for cavity protection.',4.99,null,'{toothpaste,cavity protection,oral care}',4.4,4500,null)
)
insert into public.products (brand_id, category_id, name, description, price, original_price, image, tags, rating, reviews, badge, status, created_at)
select b.id, c.id, catalog.name, catalog.description, catalog.price, catalog.original_price, '', catalog.tags::text[], catalog.rating, catalog.reviews, catalog.badge, 'Active', now() - ((row_number() over (order by catalog.name)::integer % 120) || ' days')::interval
from catalog
join public.brands b on b.name = catalog.brand
join public.categories c on c.name = catalog.category
where not exists (select 1 from public.products existing where existing.name = catalog.name);

insert into public.product_variants (product_id, size, scent, additional_price, sku)
select p.id, v.size, v.scent, v.additional_price, v.sku
from public.products p
cross join lateral (
  values
    ('Standard', null, 0.00, 'PGB-' || upper(substr(md5(p.name || '-standard'), 1, 10))),
    ('Value Size', null, 2.50, 'PGB-' || upper(substr(md5(p.name || '-value'), 1, 10)))
) as v(size, scent, additional_price, sku)
where p.status = 'Active'
and not exists (select 1 from public.product_variants existing where existing.sku = v.sku);

insert into public.inventory (variant_id, stock_quantity, reorder_level)
select v.id,
  case when right(v.sku, 1) in ('A','B') then 6 else 35 + (abs(hashtext(v.sku)) % 260) end,
  case when p.name in ('Clinical Strength Itch Relief Shampoo','Classic Clean Conditioner') then 15 else 10 end
from public.product_variants v
join public.products p on p.id = v.product_id
where not exists (select 1 from public.inventory existing where existing.variant_id = v.id);

insert into public.inventory_movements (variant_id, movement_type, quantity, reference, notes)
select inventory.variant_id, 'Stock In', inventory.stock_quantity, 'INITIAL-RECEIVING', 'Opening inventory balance from approved catalog intake.'
from public.inventory inventory
join public.product_variants variant on variant.id = inventory.variant_id
where not exists (
  select 1 from public.inventory_movements existing
  where existing.variant_id = inventory.variant_id and existing.reference = 'INITIAL-RECEIVING'
);

insert into public.cart_items (user_id, product_id, quantity, variant_id)
select admin_profile.id, product.id, 1, variant.id
from (select id from public.profiles where role = 'Super Admin' order by created_at limit 1) admin_profile
cross join lateral (select id from public.products where name = 'Regenerist Micro-Sculpting Cream' limit 1) product
join lateral (select id from public.product_variants where product_id = product.id order by sku limit 1) variant on true
on conflict (user_id, product_id) do update set quantity = excluded.quantity, variant_id = excluded.variant_id;

insert into public.wishlist_items (user_id, product_id)
select admin_profile.id, product.id
from (select id from public.profiles where role = 'Super Admin' order by created_at limit 1) admin_profile
join public.products product on product.name in ('Facial Treatment Essence', 'Pro 1000 Rechargeable Electric Toothbrush')
on conflict do nothing;

insert into public.suppliers (name, contact_email, phone, address)
select supplier.name, supplier.contact_email, supplier.phone, supplier.address
from (values
  ('Procter & Gamble Philippines Inc.', null, '+63 2 8790 0000', 'Makati City, Metro Manila'),
  ('Rustan Commercial Corporation', null, '+63 2 8888 0000', 'Makati City, Metro Manila'),
  ('Watsons Philippines', null, '+63 2 8790 6000', 'Quezon City, Metro Manila'),
  ('SM Retail Inc.', null, '+63 2 8870 0000', 'Pasay City, Metro Manila'),
  ('Puregold Price Club Inc.', null, '+63 2 8528 8000', 'Quezon City, Metro Manila'),
  ('Robinsons Retail Holdings Inc.', null, '+63 2 8397 8888', 'Quezon City, Metro Manila')
) as supplier(name, contact_email, phone, address)
where not exists (select 1 from public.suppliers existing where existing.name = 'Procter & Gamble Philippines Inc.');

insert into public.supplier_products (supplier_id, product_id)
select supplier.id, product.id
from public.suppliers supplier
cross join public.products product
where supplier.name in ('Procter & Gamble Philippines Inc.','Rustan Commercial Corporation','Watsons Philippines','SM Retail Inc.','Puregold Price Club Inc.','Robinsons Retail Holdings Inc.')
and product.status = 'Active'
on conflict do nothing;

insert into public.purchase_orders (created_by, supplier_id, status, total_cost, created_at)
select admin_profile.id, supplier.id, status.value, total.value, now() - days.value * interval '1 day'
from public.suppliers supplier
cross join lateral (select id from public.profiles where role in ('Super Admin', 'Beauty Admin', 'Beauty Staff') order by created_at limit 1) admin_profile
cross join lateral (values ('Received'), ('Approved'), ('Shipped'), ('Pending')) status(value)
cross join lateral (values (round((850 + abs(hashtext(supplier.name || status.value)) % 18000)::numeric, 2))) total(value)
cross join lateral (values (abs(hashtext(supplier.name || status.value)) % 90)) days(value)
where supplier.name in ('Procter & Gamble Philippines Inc.','Rustan Commercial Corporation','Watsons Philippines','SM Retail Inc.','Puregold Price Club Inc.','Robinsons Retail Holdings Inc.')
and not exists (select 1 from public.purchase_orders existing where existing.supplier_id = supplier.id and existing.status = status.value and existing.total_cost = total.value);

insert into public.purchase_order_items (purchase_order_id, product_id, quantity, unit_cost)
select po.id, product.id, 12 + (abs(hashtext(po.id::text)) % 80), round((product.price * 0.62)::numeric, 2)
from public.purchase_orders po
join public.suppliers supplier on supplier.id = po.supplier_id
join lateral (select product.id, product.price from public.products product join public.supplier_products sp on sp.product_id = product.id where sp.supplier_id = supplier.id order by product.name limit 1) product on true
where not exists (select 1 from public.purchase_order_items existing where existing.purchase_order_id = po.id);

insert into public.recommendation_rules (rule_name, trigger_skin_type, target_category_id, weight_modifier)
select rule.rule_name, rule.trigger_skin_type, category.id, rule.weight_modifier
from (values
  ('Hydration for Dry Skin', array['Dry']::text[], 'Skin Care', 1.50::numeric),
  ('Sensitive Skin Care', array['Sensitive']::text[], 'Skin Care', 1.45::numeric),
  ('Anti-Aging Routine', array['Mature','Anti-Aging']::text[], 'Skin Care', 1.35::numeric),
  ('Hair Repair Routine', array['Dry','Damaged','Frizzy']::text[], 'Hair Care', 1.30::numeric),
  ('Daily Oral Care', array['Daily Care']::text[], 'Oral Care', 1.15::numeric),
  ('Inventory Availability', array[]::text[], null, 1.10::numeric)
) rule(rule_name, trigger_skin_type, category_name, weight_modifier)
left join public.categories category on category.name = rule.category_name
where not exists (select 1 from public.recommendation_rules existing where existing.rule_name = rule.rule_name);

-- Keep analytics populated after the reset. These records belong to the preserved admin profile.
insert into public.orders (user_id, total_amount, subtotal, shipping_fee, tax, status, payment_status, payment_method, shipping_name, shipping_email, shipping_address, shipping_city, shipping_zip, shipping_country, created_at)
select profile.id, round((product.price + product.price * 0.12)::numeric, 2), product.price, 0, round((product.price * 0.12)::numeric, 2), order_state.status, order_state.payment_status, 'seeded_historical_card', profile.full_name, coalesce(profile.email, ''), order_state.address, 'Makati City', '1200', 'Philippines', now() - order_state.days_ago * interval '1 day'
from (select * from public.profiles where role in ('Super Admin', 'Beauty Admin', 'Beauty Staff') order by created_at limit 1) profile
cross join lateral (select p.price, p.id from public.products p where p.status = 'Active' order by p.name limit 1) product
cross join lateral (values ('Delivered','Paid',15,'12 Ayala Avenue'), ('Delivered','Paid',32,'24 Legazpi Village'), ('Processing','Unpaid',4,'8 Jupiter Street')) order_state(status, payment_status, days_ago, address)
where profile.role in ('Super Admin', 'Beauty Admin', 'Beauty Staff')
and not exists (select 1 from public.orders existing where existing.user_id = profile.id and existing.shipping_address = order_state.address);

insert into public.order_items (order_id, variant_id, quantity, price_at_purchase)
select order_record.id, variant.id, 1, order_record.subtotal
from public.orders order_record
join lateral (select v.id from public.product_variants v join public.products p on p.id = v.product_id where p.status = 'Active' order by p.name limit 1) variant on true
where not exists (select 1 from public.order_items existing where existing.order_id = order_record.id);

insert into public.payments (order_id, provider, status, amount)
select order_record.id, 'Historical payment record', order_record.payment_status, order_record.total_amount
from public.orders order_record
where not exists (select 1 from public.payments existing where existing.order_id = order_record.id);

commit;
