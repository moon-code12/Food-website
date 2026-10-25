# ZeeTummyLab

A responsive Nigerian food ordering website built with React and Vite. It includes a browsable food menu, cart and checkout flow, server-backed order and payment status support through Supabase, an order-status timeline, an About Us page, and an admin dashboard.

## Getting started

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

## Available scripts

- `npm run dev` — start the local development server
- `npm run build` — create a production build in `dist`
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

## Server setup and launch readiness

- Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to connect a Supabase project, create the admin account, and configure deployment variables. Until a project is connected, local development uses browser storage for demo orders and menu edits.
- Customers can choose payment on delivery or manual OPay transfer. The admin marks transfers paid after checking them; the site does not process payments or send order notifications.
- The contact form opens a prefilled email to `sultanabdulwaheed382@gmail.com` in the visitor’s email app; the visitor must send it. Direct website submission needs a configured email service or backend.
- The menu and provisional delivery fee policy, exact delivery zones/address, food-safety statements, reviews, customer counts, delivery-time claims, and restaurant photographs need verification before launch. The site lists Ilorin, Kwara State and daily hours of 8:00 am–10:00 pm based on the business-provided details. Menu dish photos are illustrative Wikimedia Commons photos; see the site's Food photo credits page.
