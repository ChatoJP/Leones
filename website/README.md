# LeoNes — Storefront + Shop API

Premium beauty ecommerce for LeoNes. React storefront (Vite + Tailwind v4 + Framer Motion)
plus a small Node API server (Express + built-in `node:sqlite`) for auth, orders and payments.

## Run locally

```bash
npm install

# terminal 1 — API server (port 4242)
npm run server

# terminal 2 — storefront (port 5173, proxies /api to the server)
npm run dev
```

Open http://localhost:5173.

## Environment variables

Copy `.env.example` and set what you need before starting the server
(plain env vars also work: `set STRIPE_SECRET_KEY=sk_test_... && npm run server`).

| Var | Default | What it does |
|---|---|---|
| `PORT` | 4242 | API server port |
| `APP_URL` | http://localhost:5173 | Used in Stripe success/cancel redirect URLs |
| `ADMIN_EMAILS` | jorge.manuel.granja@gmail.com | Comma-separated emails allowed into /admin/orders |
| `STRIPE_SECRET_KEY` | *(unset)* | Stripe test secret key. Unset = local DEV payment simulator |
| `STRIPE_WEBHOOK_SECRET` | *(unset)* | From `stripe listen`, verifies webhook signatures |
| `SHIPPING_FLAT` | 4.90 | Flat shipping (EUR) |
| `FREE_SHIPPING_OVER` | 35 | Free shipping threshold (EUR) |

Data lives in `server/leones.db` (SQLite). Delete the file to reset everything.

## How to test

**Registration/login:** `/register` → create account (8+ char password) → lands on `/account`.
Refresh — session persists (30-day httpOnly cookie). Log out from `/account`. `/login` to sign
back in. `/forgot-password` issues a reset token — email sending is a TODO, so in dev the reset
link is printed in the **API server console**; open it to set a new password.

**Cart:** add products from the homepage (hero CTA, drop cards, bundle) or a product page.
`/cart` — quantity +/−, remove, totals, free-shipping hint. Cart persists in localStorage
(guests included) and survives login. Empty cart shows a branded empty state.

**Checkout:** `/checkout` (redirects to `/cart` when empty). Fill delivery details — all fields
validated. Totals are recomputed **server-side** from `shared/catalog.json`; tampering with
prices or quantities in the request is rejected.

**Payment (no Stripe keys):** click *Pay now* → order is created as `pending` → local
**payment simulator** page (DEV ONLY, auto-disabled once Stripe is configured) → choose
success or cancel → `/checkout/success` (cart cleared, PT thank-you message, order number)
or `/checkout/cancel` (bag untouched).

**Payment (Stripe test mode):**
1. Set `STRIPE_SECRET_KEY=sk_test_...` and restart the server — checkout now redirects to Stripe.
2. Test card: `4242 4242 4242 4242`, any future expiry, any CVC, any postal code.
3. Cancel by clicking the back arrow on the Stripe page → `/checkout/cancel`.
4. Webhook (marks orders paid): `stripe listen --forward-to localhost:4242/api/stripe/webhook`,
   put the printed `whsec_...` in `STRIPE_WEBHOOK_SECRET`, restart. Without the webhook the
   order stays `pending` even after payment — by design, the success page never marks orders paid.

**Orders:** `/account/orders` (your orders, protected), success page polls until the webhook
confirms. **Admin:** sign in with an email in `ADMIN_EMAILS` → `/admin/orders` — every order
with payment/order status, expandable shipping details. Other users get "Not authorized".

**Full E2E script:** with both servers running, `node e2e.mjs` exercises register → cart →
checkout → simulated payment → success → account orders → admin gate → price-tampering rejection.

## Routes

`/` `/products/:slug` `/cart` `/checkout` `/checkout/success` `/checkout/cancel`
`/login` `/register` `/forgot-password` `/account` `/account/orders` `/admin/orders`
`/dev-pay` *(dev simulator only)*

## Known limitations / TODOs

- **Emails:** no SMTP configured. Order-confirmation + admin-notification hooks are marked
  `TODO(email)` in `server/index.mjs`; password-reset links print to the server console.
- **Stock** is stored in the catalog but not yet decremented on purchase.
- **Order fulfillment statuses** (shipped/completed) have no admin UI to change them yet.
- Dev payment simulator is intentionally unavailable when Stripe is configured.
- `shared/catalog.json` is the single source of truth for prices; product presentation
  copy stays in `src/data/products.ts` (display fields sync from the catalog at load).

## Asset pipeline

Product imagery/video generation lives in `../tools/generate-assets.mjs` (kie.ai).
Product art in `public/products`, swatches in `public/swatches`, brand logos in `public/brand`.
