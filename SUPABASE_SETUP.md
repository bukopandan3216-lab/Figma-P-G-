# Supabase setup

The app expects these local environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The project-local `.env.local` is ignored by git. Never put the PostgreSQL connection string or database password in frontend code or a Vite environment variable.

## Initialize the empty project

1. Open the Supabase dashboard for the project and open **SQL Editor**.
2. Run [`supabase/schema.sql`](supabase/schema.sql) once.
3. If the database already has the older schema, run [`supabase/relationship_fix.sql`](supabase/relationship_fix.sql).
4. Run [`supabase/seed_1000.sql`](supabase/seed_1000.sql) to **wipe public business data while preserving the configured admin profile**, then load the curated P&G catalog, real brand/category names, variants for every product, inventory movements, Philippine supplier records, purchase orders connected to the admin creator, recommendation rules, and historical analytics orders. This is destructive and should only be run when a full reset is intended.
5. In **Authentication > Providers**, enable Email. Enable Google and Facebook only after configuring their provider client IDs and redirect URLs.
6. Reload the Vite app.

The schema creates the requested relational tables, indexes, RLS policies, analytical views, and the transactional `place_order` function. Checkout calls that function so an insufficient-stock item rolls back the order, item rows, payment marker, and inventory decrement together.

## Production payment note

The card step currently creates a pending Stripe payment record and does not store card number, expiry, or CVV. A Supabase Edge Function or server-side payment endpoint must create and confirm the Stripe PaymentIntent before marking `orders.payment_status = 'Paid'`. The publishable client must never receive the database connection string or service-role key.
