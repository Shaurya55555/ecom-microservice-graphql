#!/usr/bin/env node
/**
 * In-memory stand-in for the GraphQL gateway, so the frontend can be developed
 * and demoed without Docker, MongoDB or Kafka:   npm run mock
 *
 * The schema is read straight from ../graphql-gateway/src/schemas/index.js so
 * it can't drift from the real one. Roles and ownership rules mirror the
 * services (buyers order, sellers manage their own products and respond to
 * orders, admins manage accounts).
 *
 * Demo logins (password for all: password1)
 *   admin@demo.com · seller@demo.com · seller2@demo.com · buyer@demo.com
 */
import http from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { buildSchema, graphql } from "graphql";

const here = dirname(fileURLToPath(import.meta.url));
// MOCK_SCHEMA lets you point at an older schema to test compatibility with a gateway that predates the current one.
const schemaFile = process.env.MOCK_SCHEMA
  ? resolve(process.env.MOCK_SCHEMA)
  : resolve(here, "../../graphql-gateway/src/schemas/index.js");
const sdl = readFileSync(schemaFile, "utf8").match(/gql`([\s\S]*?)`;/)?.[1];
if (!sdl) throw new Error(`Could not extract the SDL from ${schemaFile}`);
const schema = buildSchema(sdl);

const PORT = Number(process.env.PORT ?? 4000);
const PASSWORD = "password1";
let seq = 1000;
const newId = () => (++seq).toString(16).padStart(24, "a");
const daysAgo = (d) => new Date(Date.now() - d * 86_400_000).toISOString();

/* ------------------------------ seed data ------------------------------ */
const accounts = [
  { id: "a00000000000000000000001", username: "admin", email: "admin@demo.com", role: "admin", active: true },
  { id: "a00000000000000000000002", username: "maya", email: "seller@demo.com", role: "seller", active: true },
  { id: "a00000000000000000000003", username: "leo", email: "seller2@demo.com", role: "seller", active: true },
  { id: "a00000000000000000000004", username: "sam", email: "buyer@demo.com", role: "user", active: true },
];
const [, MAYA, LEO, SAM] = accounts.map((a) => a.id);

const seed = (sellerId, category, name, price, description, ageDays) => ({
  id: newId(),
  sellerId,
  category,
  name,
  price,
  description,
  imageUrl: "",
  createdAt: daysAgo(ageDays),
});

const products = [
  seed(MAYA, "Electronics", "Aurora Wireless Headphones", 129.99, "Over-ear Bluetooth headphones with active noise cancelling, 40-hour battery and a plush memory-foam fit.", 1),
  seed(MAYA, "Electronics", "Pulse Mechanical Keyboard", 89.0, "Hot-swappable 75% keyboard with tactile switches, PBT keycaps and per-key RGB.", 2),
  seed(MAYA, "Electronics", "Orbit 4K Webcam", 74.5, "Sharp 4K streaming webcam with auto-framing, a privacy shutter and a dual-mic array.", 12),
  seed(LEO, "Electronics", "Volt 65W GaN Charger", 39.99, "Pocket-sized three-port fast charger that powers a laptop, phone and earbuds at once.", 20),
  seed(LEO, "Fashion", "Everyday Merino Hoodie", 98.0, "A midweight merino-blend hoodie that stays fresh for days. Naturally temperature regulating.", 3),
  seed(LEO, "Fashion", "Trail Canvas Backpack", 64.0, "Waxed canvas 22L backpack with a padded laptop sleeve and weatherproof zips.", 15),
  seed(MAYA, "Fashion", "Linen Overshirt", 58.0, "Relaxed garment-washed linen overshirt that softens with every wear.", 30),
  seed(LEO, "Home", "Ember Ceramic Mug Set", 32.0, "Set of four hand-glazed stoneware mugs. Dishwasher and microwave safe.", 5),
  seed(MAYA, "Home", "Halo Desk Lamp", 54.99, "Dimmable LED desk lamp with warm-to-cool tones and a wireless charging base.", 9),
  seed(LEO, "Home", "Cloud Weighted Blanket", 119.0, "Breathable 15 lb weighted blanket with a removable, machine-washable cover.", 40),
  seed(MAYA, "Sports", "Flow Yoga Mat 6mm", 45.0, "Grippy, extra-cushioned natural rubber mat with alignment guides.", 6),
  seed(LEO, "Sports", "Summit Insulated Bottle", 27.5, "Triple-wall steel bottle that keeps drinks cold for 24 hours or hot for 12.", 25),
  seed(MAYA, "Books", "The Pragmatic Programmer", 42.0, "The classic guide to craft and career for working software developers.", 50),
  seed(LEO, "Books", "Designing Data-Intensive Applications", 49.9, "The big ideas behind reliable, scalable and maintainable systems.", 33),
  seed(MAYA, "Beauty", "Glow Vitamin C Serum", 28.0, "Brightening daily serum with 15% vitamin C and hyaluronic acid.", 2),
  seed(LEO, "Toys & Games", "Cascade Marble Run (120 pc)", 36.0, "Build-your-own marble run with 120 pieces — hours of open-ended play.", 18),
  seed(MAYA, "General", "Travel Cable Organizer", 14.0, "Zippered organizer that keeps chargers, cables and adapters in order.", 60),
];

const orders = [
  { id: newId(), productId: products[0].id, userId: SAM, quantity: 1, status: "Accepted" },
  { id: newId(), productId: products[4].id, userId: SAM, quantity: 2, status: "Pending" },
  { id: newId(), productId: products[7].id, userId: SAM, quantity: 1, status: "Rejected" },
];

/* ------------------------------ auth helpers ------------------------------ */
const issue = (account) =>
  "mock." + Buffer.from(JSON.stringify({ userId: account.id, role: account.role })).toString("base64url");

function who(ctx) {
  const token = ctx.authorization?.replace(/^Bearer /, "");
  if (!token?.startsWith("mock.")) return null;
  try {
    return JSON.parse(Buffer.from(token.slice(5), "base64url").toString());
  } catch {
    return null;
  }
}

/** Mirrors how axios errors surface through the real gateway. */
const fail = (status) => {
  throw new Error(`Request failed with status code ${status}`);
};
const need = (ctx, ...roles) => {
  const user = who(ctx);
  if (!user) fail(401);
  if (roles.length && !roles.includes(user.role)) fail(403);
  return user;
};

/* ------------------------------ resolvers ------------------------------ */
const root = {
  getProducts: () => products,
  getProduct: ({ id }) => products.find((p) => p.id === id) ?? fail(404),
  getOrders: () => orders,
  getOrder: ({ id }) => orders.find((o) => o.id === id) ?? fail(404),
  getUsers: () => accounts.map((a) => ({ id: a.id, name: a.username, email: a.email })),
  getUser: ({ id }) => {
    const a = accounts.find((x) => x.id === id) ?? fail(404);
    return { id: a.id, name: a.username, email: a.email };
  },
  getSellerOrders: (_, ctx) => {
    const user = need(ctx, "seller");
    const mine = new Set(products.filter((p) => p.sellerId === user.userId).map((p) => p.id));
    return orders.filter((o) => mine.has(o.productId));
  },
  getAccounts: (_, ctx) => (need(ctx, "admin"), accounts),

  register: ({ username, email, password, role }) => {
    if (!username || !email || !password) fail(400);
    if (role && !["user", "seller"].includes(role)) fail(400);
    if (accounts.some((a) => a.email === email)) fail(409);
    const account = { id: newId(), username, email, role: role || "user", active: true, password };
    accounts.push(account);
    return { message: "User registered successfully", userId: account.id };
  },
  login: ({ email, password }) => {
    const account = accounts.find((a) => a.email === email) ?? fail(404);
    if ((account.password ?? PASSWORD) !== password) fail(401);
    if (!account.active) fail(403);
    return { token: issue(account), userId: account.id, username: account.username, email, role: account.role };
  },
  createProduct: (args, ctx) => {
    const user = need(ctx, "seller", "admin");
    const product = {
      id: newId(),
      sellerId: user.userId,
      category: args.category || "General",
      imageUrl: args.imageUrl || "",
      name: args.name,
      description: args.description,
      price: args.price,
      createdAt: new Date().toISOString(),
    };
    products.unshift(product);
    return product;
  },
  updateProduct: ({ id, ...fields }, ctx) => {
    const user = need(ctx, "seller", "admin");
    const product = products.find((p) => p.id === id) ?? fail(404);
    if (user.role !== "admin" && product.sellerId !== user.userId) fail(403);
    for (const [k, v] of Object.entries(fields)) if (v !== undefined && v !== null) product[k] = v;
    return product;
  },
  deleteProduct: ({ id }, ctx) => {
    const user = need(ctx, "seller", "admin");
    const index = products.findIndex((p) => p.id === id);
    if (index < 0) fail(404);
    if (user.role !== "admin" && products[index].sellerId !== user.userId) fail(403);
    return products.splice(index, 1)[0];
  },
  createOrder: ({ productId, userId, quantity }, ctx) => {
    const user = need(ctx, "user");
    if (user.userId !== userId) fail(403);
    if (!products.some((p) => p.id === productId)) fail(404);
    if (!(quantity > 0)) fail(400);
    const order = { id: newId(), productId, userId, quantity, status: "Pending" };
    orders.push(order);
    return order;
  },
  respondToOrder: ({ id, accept }, ctx) => {
    const user = need(ctx, "seller");
    const order = orders.find((o) => o.id === id) ?? fail(404);
    const product = products.find((p) => p.id === order.productId);
    if (!product || product.sellerId !== user.userId) fail(403);
    if (order.status !== "Pending") fail(409);
    order.status = accept ? "Accepted" : "Rejected";
    return order;
  },
  setAccountActive: ({ userId, active }, ctx) => {
    need(ctx, "admin");
    const account = accounts.find((a) => a.id === userId) ?? fail(404);
    account.active = active;
    return account;
  },
  createUser: ({ name, email }) => ({ id: newId(), name, email }),
};

// graphql-js default resolver calls function properties as (args, context, info);
// adapt so resolvers get (args, ctx).
const wrapped = Object.fromEntries(
  Object.entries(root).map(([k, fn]) => [k, (args, ctx) => fn(args, ctx)])
);

/* ------------------------------ http server ------------------------------ */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

http
  .createServer(async (req, res) => {
    if (req.method === "OPTIONS") return res.writeHead(204, CORS).end();
    if (req.method !== "POST") return res.writeHead(405, CORS).end();

    let body = "";
    for await (const chunk of req) body += chunk;
    try {
      const { query, variables, operationName } = JSON.parse(body);
      const result = await graphql({
        schema,
        source: query,
        rootValue: wrapped,
        contextValue: { authorization: req.headers.authorization ?? null },
        variableValues: variables,
        operationName,
      });
      // Like Apollo Server: a validation failure (no `data` key at all) is an HTTP 400.
      const status = "data" in result ? 200 : 400;
      res.writeHead(status, { ...CORS, "Content-Type": "application/json" }).end(JSON.stringify(result));
    } catch (err) {
      res
        .writeHead(400, { ...CORS, "Content-Type": "application/json" })
        .end(JSON.stringify({ errors: [{ message: String(err.message ?? err) }] }));
    }
  })
  .listen(PORT, () => {
    console.log(`Mock GraphQL gateway on http://localhost:${PORT}/  (${products.length} products)`);
    console.log("Logins (password1): admin@demo.com · seller@demo.com · seller2@demo.com · buyer@demo.com");
  });
