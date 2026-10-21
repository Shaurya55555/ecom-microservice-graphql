# Deploying

Local: `JWT_SECRET=<anything> docker compose up --build` runs everything
(Mongo, ZooKeeper, Kafka, 4 services, gateway on :4000).

Hosted: Render for the services, MongoDB Atlas for the database, Confluent
Cloud for Kafka. Render has no Kafka, and Confluent Cloud accepts SASL/PLAIN,
which is the only mechanism kafka-node (the Node services) supports.

## 1. MongoDB Atlas
Create a free M0 cluster, a database user, and allow `0.0.0.0/0` under Network
Access (Render free services have no fixed IP). Copy the connection string
(`mongodb+srv://...`). Use it as `MONGO_URI` for all four backend services;
each service picks its own database name, so one cluster is enough. For the
Go service the database is always `notification-service`.

## 2. Confluent Cloud
Create a Basic cluster, then:
- Topics: `order-events` (3 partitions), `order-events-dlq`, `user-events`,
  `product-events`. Create them by hand; auto-create is off on Confluent.
- An API key. The key is `KAFKA_SASL_USERNAME`, the secret is
  `KAFKA_SASL_PASSWORD`, and the bootstrap server (`host:9092`) is `KAFKA_BROKER`.

Setting `KAFKA_SASL_USERNAME` turns on TLS + SASL/PLAIN in every service. The
Go service also accepts `KAFKA_SASL_MECHANISM=scram-sha-256|scram-sha-512`
(for brokers such as Redpanda), but the Node services cannot use SCRAM.

## 3. Render
New > Blueprint > pick this repo (`render.yaml`). Fill the secrets it asks for.
`JWT_SECRET` must be the same value in user, product and order service.
After the first deploy, set the cross-service URLs (the services' own
`https://<name>.onrender.com`): `PRODUCT_SERVICE_URL` on order-service and
the four `*_SERVICE_URL` values on graphql-gateway, then redeploy.

Free web services sleep after inactivity; the first request wakes them.
The Go service must stay awake to consume events, so use a paid instance or
an uptime ping on `/health` for it.

## Checks
- `GET https://<notification-service>/health` returns `{"status":"ok"}`.
- `POST` a GraphQL `{ getNotifications(userId: "<id>") { type status message } }`
  to the gateway after placing and accepting an order.

Status: the Docker path is tested end to end. The Render blueprint and the
SASL/TLS path have not been run against real Render/Confluent accounts.
