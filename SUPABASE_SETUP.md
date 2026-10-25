# Connect the live order system

The app now has a Supabase database integration, but it remains in demo mode until a Supabase project is created and configured.

## 1. Create the project

Create a project in Supabase. In **Project Settings → API**, copy the project URL and the publishable key. Do not use or share a `service_role` or secret key in this React app.

## 2. Create the database tables

Open the project’s SQL Editor and run [`supabase/migrations/202610150001_initial_store.sql`](supabase/migrations/202610150001_initial_store.sql). This creates the menu, orders, order items, order and payment status rules, public order submission and tracking functions, admin-only policies, and starter menu data.

The migration currently seeds the menu already shown in the demo. Confirm every dish, price, availability flag, and photo before accepting real orders. The current starter delivery rule is ₦1,500 below ₦30,000 and free at or above ₦30,000; it is provisional and must be updated in both the app and database migration if your fees change.

## 3. Create the admin account

In **Authentication → Users**, create and verify the store account `sultanabdulwaheed382@gmail.com` with a strong password. The SQL policies grant dashboard and menu access only to a signed-in account with this email. Keep public sign-ups disabled; customers do not need accounts to order or track orders.

## 4. Configure local development

Copy `.env.example` to `.env.local` and fill in the project URL and publishable key:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Restart the Vite server after changing environment variables. `.env.local` is ignored by Git.

## 5. Configure deployment

Set the same two `VITE_` variables in the hosting provider’s environment settings and redeploy. Production builds without these values block order submission and the admin dashboard instead of saving pretend orders in the visitor’s browser.

## Current payment behavior

Customers can select payment on delivery or manual OPay transfer. Transfer orders start as **Awaiting verification**; the signed-in admin marks them **Paid** after checking the transfer. This is not an automatic payment integration and does not send notifications.

## Still needed before launch

- Confirm the exact restaurant address and delivery zones for Ilorin, Kwara State. The site currently lists daily hours as 8:00 am–10:00 pm; update these if needed.
- Confirm the menu, photos, and provisional delivery charges before launch. If charges change, update both the app and the database migration so checkout totals match.
- Replace sample reviews, customer counts, delivery-time claims, and illustrative food-safety statements with verified information.
- Add a privacy notice and a support plan for customer data, backups, order spam, and database access.
- Configure and test a real deployment with the project’s URL restrictions, auth settings, and production environment variables.
