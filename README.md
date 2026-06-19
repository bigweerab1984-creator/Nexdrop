# NexDrop

A real dropshipping storefront: Next.js frontend + serverless backend,
CJ Dropshipping for products/fulfillment, Stripe for payments, Postgres
for order records.

## How money and orders actually flow

1. Customer browses `/shop` → frontend calls `/api/products`, which calls
   CJ's catalog API server-side and marks up the price.
2. Customer adds items, clicks Checkout → `/api/checkout` re-fetches real
   prices from CJ (never trusts the browser) and creates a Stripe Checkout
   Session, then redirects the customer to Stripe's hosted payment page.
3. Customer pays on Stripe's page (you never touch card numbers).
4. Stripe calls your `/api/webhook` server-to-server once payment is
   confirmed. **This webhook is the only place that pushes the order to
   CJ for fulfillment** and saves it to the database.
5. Customer lands on `/checkout/success` — a pure confirmation screen
   that does nothing except say thank you, so refreshing it is harmless.

This separation (webhook = source of truth, success page = just a message)
is the standard, safe pattern. Don't move the CJ order call to the success
page — that can be gamed.

## Setup

```bash
npm install
cp .env.example .env.local
# fill in .env.local with real keys (see below)
npm run dev
```

### 1. CJ Dropshipping
- Sign up at cjdropshipping.com
- In the app/site: **Setting → Account → API Setting → Generate API Keys**
- Copy the generated key (looks like `CJUserNum@api@xxxxxxxxxxxxxxxxxxxxx`)
  into `CJ_API_KEY` in `.env.local`

### 2. Stripe
- Sign up at stripe.com
- Developers → API keys → copy the **test mode** secret + publishable keys
- Put them in `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- For the webhook secret, you need the Stripe CLI while developing locally:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhook
  ```
  This prints a `whsec_...` value — put that in `STRIPE_WEBHOOK_SECRET`.
  In production (Vercel), you'll instead create a webhook endpoint in the
  Stripe dashboard pointing at `https://yourdomain.com/api/webhook` and use
  the secret it gives you there.

### 3. Database
- In your Vercel project: Storage tab → Create → Postgres
- Connect it to this project — Vercel injects `POSTGRES_URL` etc. automatically
- Locally, pull those same values with `vercel env pull .env.local`

## Deploying

```bash
npm i -g vercel
vercel
```

Then in the Vercel dashboard, set the same environment variables from
`.env.local` under Project → Settings → Environment Variables (use your
**live** Stripe keys only when you're ready to take real payments).

## Known gaps to close before going fully live

- **Variant selection**: CJ products have variants (size/color) each with
  their own `vid`. The current shop page treats `pid` as if it were
  orderable directly — you'll want a product detail page where the
  customer picks a variant, and store that `vid` in the cart instead.
- **Shipping cost**: CJ shipping cost isn't included in pricing yet —
  decide whether to bake it into your markup or charge it separately via
  Stripe's `shipping_options`.
- **Error recovery**: if the CJ order push in the webhook fails after
  Stripe payment succeeds, you have a paid customer with no order placed.
  The webhook logs this loudly — wire that log to an alert (e.g. email
  yourself, or pipe logs to a monitoring tool) so you catch it same-day.
- **Order status sync**: poll CJ's order status API periodically (e.g. a
  cron via Vercel Cron Jobs) to update tracking numbers in your `orders`
  table and email customers when their item ships.
