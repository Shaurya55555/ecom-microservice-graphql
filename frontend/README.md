# Frontend

Next.js (App Router) + Apollo Client + Tailwind CSS + Redux Toolkit frontend
for [`ecom-microservice-graphql`](../README.md). Talks to the `graphql-gateway`
service — product catalog, auth (register/login), cart, and checkout against
the real `createOrder` mutation.

## Run locally against the existing backend

From the repo root:

```bash
docker-compose up -d
```

This starts MongoDB, Kafka, the three microservices, and the GraphQL gateway
at `http://localhost:4000/`.

Then, in this directory:

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

- `NEXT_PUBLIC_GRAPHQL_ENDPOINT` — URL of the GraphQL gateway. Defaults to
  `http://localhost:4000/` (the gateway's `apollo-server` package serves
  GraphQL at `/`, not `/graphql`). Point this at a deployed gateway URL to
  run the frontend against a hosted backend instead of the local
  docker-compose stack.

## Notes on the current backend

- Auth (`register`/`login`) and JWT verification on order creation were
  added to the gateway/user-service/order-service alongside this frontend —
  see the root README/commit history for what changed there.
- `getOrders` has no per-user filter in the schema, so `/account` fetches
  all orders and filters by `userId` client-side.
- Order status never advances past `Pending` yet — the Kafka order consumer
  only logs events, it doesn't write status transitions. `/orders/[id]`
  polls `getOrder` every 3s and is ready for when that's wired up.
