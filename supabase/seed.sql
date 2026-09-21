-- P&G Beauty catalog seed. Run after schema.sql.

insert into public.brands (name, description) values
  ('Olay', 'Science-backed skincare'),
  ('Pantene', 'Hair health and repair'),
  ('Head & Shoulders', 'Scalp and hair care'),
  ('Secret', 'Personal care protection'),
  ('Ivory', 'Gentle body care')
on conflict (name) do nothing;

insert into public.categories (name, description, image) values
  ('Skin Care', 'Moisturizers, serums, cleansers & more', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=400&fit=crop&auto=format'),
  ('Hair Care', 'Shampoos, conditioners & treatments', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&auto=format'),
  ('Body Care', 'Body lotions, washes & scrubs', 'https://images.unsplash.com/photo-1585232350009-d608de6e5f50?w=600&h=400&fit=crop&auto=format'),
  ('Personal Care', 'Deodorants and personal care essentials', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&auto=format')
on conflict (name) do update set description = excluded.description, image = excluded.image;

insert into public.products (brand_id, category_id, name, description, price, original_price, image, images, tags, rating, reviews, badge, status)
select b.id, c.id, p.name, p.description, p.price, p.original_price, p.image, p.images, p.tags, p.rating, p.reviews, p.badge, 'Active'
from (values
 ('Olay','Skin Care','Regenerist Micro-Sculpting Cream','Advanced amino-peptide complex moisturizer that firms skin and boosts collagen production.',28.99,34.99,'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&auto=format',array['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop&auto=format'],array['moisturizer','anti-aging','face cream'],4.7,2341,'Best Seller'),
 ('Pantene','Hair Care','Pro-V Moisture Boost Shampoo','Strengthens hair from within with Pro-Vitamin B5 complex.',12.49,null,'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400&h=400&fit=crop&auto=format',array['https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&h=600&fit=crop&auto=format'],array['shampoo','moisture','haircare'],4.5,8732,'New'),
 ('Olay','Skin Care','Classic Gentle Facial Cleanser','Gentle enough for sensitive skin and removes makeup without stripping moisture.',9.99,null,'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop&auto=format',array['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop&auto=format'],array['cleanser','gentle','sensitive'],4.6,5219,'Almost Sold Out'),
 ('Secret','Personal Care','Clinical Strength Antiperspirant','48-hour sweat and odor protection with a soft powder scent.',11.99,null,'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&h=400&fit=crop&auto=format',array['https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&h=600&fit=crop&auto=format'],array['deodorant','antiperspirant'],4.8,12504,null),
 ('Head & Shoulders','Hair Care','Classic Clean Conditioner','Removes dandruff while conditioning hair for a smooth healthy look.',10.99,null,'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&auto=format',array['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop&auto=format'],array['conditioner','dandruff','hair care'],4.4,3891,'Almost Sold Out'),
 ('Ivory','Body Care','Body Butter Ultra Nourishing Cream','Rich whipped body butter infused with shea and cocoa butter.',7.49,9.99,'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=400&fit=crop&auto=format',array['https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=600&fit=crop&auto=format'],array['body lotion','moisturizer','shea butter'],4.3,2167,'Sale'),
 ('Olay','Skin Care','Vitamin C Brightening Serum','10% Vitamin C and Niacinamide formula that visibly brightens skin tone.',22.49,null,'https://images.unsplash.com/photo-1631390180563-7f01e393a7e5?w=400&h=400&fit=crop&auto=format',array['https://images.unsplash.com/photo-1631390180563-7f01e393a7e5?w=600&h=600&fit=crop&auto=format'],array['serum','vitamin C','brightening'],4.6,1489,null),
 ('Pantene','Hair Care','Total Repair Mask Treatment','Deep conditioning mask that repairs signs of damage in one wash.',8.99,null,'https://images.unsplash.com/photo-1626274890657-b28e2b12c4b9?w=400&h=400&fit=crop&auto=format',array['https://images.unsplash.com/photo-1626274890657-b28e2b12c4b9?w=600&h=600&fit=crop&auto=format'],array['hair mask','repair','deep conditioning'],4.5,934,null)
) as p(brand, category, name, description, price, original_price, image, images, tags, rating, reviews, badge)
join public.brands b on b.name = p.brand
join public.categories c on c.name = p.category
where not exists (select 1 from public.products existing where existing.name = p.name);

insert into public.product_variants (product_id, size, scent, sku)
select p.id, 'Standard', null, 'PGB-' || upper(substr(md5(p.id::text), 1, 10))
from public.products p
where not exists (select 1 from public.product_variants v where v.product_id = p.id);

insert into public.inventory (variant_id, stock_quantity, reorder_level)
select v.id, case when p.name in ('Classic Gentle Facial Cleanser', 'Classic Clean Conditioner') then 8 else 100 end, 10
from public.product_variants v
join public.products p on p.id = v.product_id
where not exists (select 1 from public.inventory i where i.variant_id = v.id);

insert into public.recommendation_rules (rule_name, trigger_skin_type, weight_modifier)
select rule_name, trigger_skin_type, weight_modifier
from (values
  ('Skin Type Match', array['Dry','Sensitive','Combination','Oily']::text[], 1.50::numeric),
  ('Concern Match', array['Anti-Aging','Dark Spots','Frizz Control']::text[], 1.25::numeric),
  ('Inventory Availability', array[]::text[], 1.10::numeric),
  ('Trending Uplift', array[]::text[], 1.05::numeric)
) rules(rule_name, trigger_skin_type, weight_modifier)
where not exists (select 1 from public.recommendation_rules r where r.rule_name = rules.rule_name);
