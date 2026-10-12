# Ecom.store — frontend

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Apollo Client · Redux Toolkit ·
React Hook Form + Zod · Vitest + Testing Library. Talks to the `graphql-gateway` of
[`ecom-microservice-graphql`](../README.md).

## Features

**Shopper** — landing page, product listing with URL-synced search / category / price / sort and
pagination, server-rendered product pages (SEO title + Open Graph), wishlist, persistent cart,
validated checkout (shipping address), live order tracking, order history.
**Seller** — dashboard with stats, accept/reject order requests, create / edit / delete products
(category + image URL, live preview). **Admin** — platform stats, order-outcome bar, searchable
account list with activate/deactivate.
**Platform** — light/dark theme (system default), toasts, skeleton loading, empty/error states,
error + 404 boundaries, role-based route guards, keyboard + screen-reader support (skip link,
labelled controls, `aria-*`, reduced-motion), responsive down to phone width.

## Run it

Against the real stack (needs Docker):

```bash
docker-compose up -d          # repo root: MongoDB, Kafka, services, gateway on :4000
cd frontend && cp .env.local.example .env.local && npm install && npm run dev
```

Without Docker — an in-memory mock gateway that reads the real schema file and enforces the same roles:

```bash
npm run mock    # terminal 1  → http://localhost:4000
npm run dev     # terminal 2  → http://localhost:3000
```

Demo logins (password `password1`): `buyer@demo.com`, `seller@demo.com`, `seller2@demo.com`, `admin@demo.com`.

## Scripts

`dev` · `build` · `start` · `lint` · `typecheck` · `test` · `test:watch` · `mock`

## Structure

```
src/app/            routes (page.tsx per route; layout.tsx files only set titles)
src/components/     ui/ (design system), product/, catalog/, cart/, orders/, seller/, auth/, layout/
src/lib/            catalog.ts (filter/sort/paginate), validation/ (zod), redux/, graphql/, auth.ts
scripts/            mock-gateway.mjs
```

Design tokens (colours, shadows) live in `globals.css`; components use semantic classes
(`bg-surface`, `text-muted`, `border-line`…) so both themes stay in sync.

## Notes & limits

- The backend has no stock, ratings, payments or order addresses. Shipping address is remembered
  client-side (localStorage) and shown on the order page; payment is "pay on delivery" (demo).
- `getProducts` returns everything, so filtering/sorting/pagination run client-side.
- Backend additions made for this frontend: product `category`, `imageUrl`, `createdAt`, and
  `updateProduct` / `deleteProduct` (owner-or-admin), plus a 409 (not 500) for a duplicate username.
  They exist in `product-service`, `user-service`, `graphql-gateway` and the hosted
  [`ecom-demo-gateway`](https://github.com/Shaurya55555/ecom-demo-gateway).
- **Older gateways are tolerated.** `src/lib/apollo/compat.ts` detects a gateway that predates
  those fields, strips them from the operation and retries once (remembered per browser session).
  Shopping, checkout and order tracking work either way; categories, product images and
  seller edit/delete appear once the gateway is updated. `MOCK_SCHEMA=<old schema file> npm run mock`
  simulates an old gateway for testing.
- Accepting/rejecting an order is applied by `order-service` through a Kafka consumer, so that one
  step needs the full docker-compose stack (the mock gateway handles it directly).

## Deploying

`npx vercel deploy --prod` from this folder (project is linked). `NEXT_PUBLIC_GRAPHQL_ENDPOINT` is a
build-time variable set on the Vercel project; the production value points at the hosted gateway.
