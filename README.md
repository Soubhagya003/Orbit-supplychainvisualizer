# Orbit — Supply Chain Visualizer

**A backend platform for supply-chain network visibility, shipment tracking, inventory monitoring, and operational analytics.**

Orbit Supply Chain Visualizer provides a REST API for representing supply-chain facilities and transport links, managing products and stock, tracking shipments, and calculating delivery-performance metrics. The backend is built with Node.js and Express, uses MongoDB for persistent data, Redis for caching and rate-limit storage, and Nginx as a reverse proxy in the Docker setup.

> **Repository scope:** this repository contains the backend API and its infrastructure configuration. A frontend website is not included in the repository tree currently visible on GitHub.

Repository: [Soubhagya003/Orbit-supplychainvisualizer](https://github.com/Soubhagya003/Orbit-supplychainvisualizer)

---

## Contents

- [Why Orbit?](#why-orbit)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Analytics](#analytics)
- [Data Model Overview](#data-model-overview)
- [Operational Notes](#operational-notes)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Why Orbit?

Supply-chain operations span facilities, transport routes, products, inventory, and deliveries. When this information is disconnected, it becomes harder to spot low-stock locations, understand delivery performance, and identify weak transport lanes.

Orbit brings these core operational records behind one API. It exposes network data, stock levels, shipment states, and summary analytics so a compatible dashboard or other client application can present a consolidated view of the supply chain.

## Features

### Supply-chain network
- Create and retrieve supply-chain nodes/facilities.
- Classify nodes by type and status.
- Store geographic coordinates and capacity information for network visualization.
- Define connections between nodes, including transport type, distance, travel time, cost per unit, and status.
- Query connections by source node, target node, or source/target pair.

### Product catalogue
- Store product names, descriptions, SKUs, prices, weights, and statuses.
- Retrieve products by internal ID or SKU.
- Cache the product-list response in Redis to reduce repeated database reads.

### Inventory visibility
- Maintain stock quantities for a product at a particular node.
- Configure minimum and maximum stock thresholds.
- Retrieve inventory by node or product.
- Retrieve low-stock records.
- Return enriched inventory data with the associated node/product names and a derived status:
  - `critical` — quantity is zero or below.
  - `low` — quantity is at or below the configured minimum threshold.
  - `excess` — quantity is at or above the configured maximum threshold.
  - `optimal` — none of the preceding conditions apply.

### Shipment tracking
- Store shipment source and destination, status, departure date, estimated arrival, actual arrival, and shipment items.
- Query shipments by source, destination, status, or date range.
- Return enriched shipment records with source/destination names and product names.
- Adjust inventory quantities through shipment-related operations when the corresponding shipment workflow is used.

### Operational analytics
The `GET /api/analytics/summary` endpoint calculates:
- On-time delivery rate for delivered shipments with arrival dates available.
- Average lead time in days for delivered shipments with departure and actual-arrival dates.
- Exception rate based on shipments marked `delayed`.
- SLA/on-time rate by source-to-destination lane.
- Estimated-versus-actual lead-time comparison by node-type segment.
- Total and delivered shipment counts.

These metrics are calculated from the records in MongoDB; they are not machine-learning forecasts.

### Authentication and API protection
- User registration and login endpoints.
- Password hashing with `bcryptjs`.
- JSON Web Token (JWT) authentication for protected write operations.
- Role-based middleware for authorized operations.
- Global request rate limiting: up to 100 requests per IP per 15-minute window, backed by Redis.
- CORS allow-list configuration.

### Infrastructure
- Docker Compose services for the API, MongoDB, Redis, and Nginx.
- Persistent Docker volumes for MongoDB and Redis data.
- Nginx reverse-proxy configuration under `nginx/`.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Runtime | Node.js |
| API framework | Express 4 |
| Database | MongoDB 7, Mongoose 8 |
| Authentication | JSON Web Tokens, bcryptjs |
| Cache and rate-limit store | Redis 7, ioredis, rate-limit-redis |
| Middleware | CORS, dotenv, express-rate-limit |
| Reverse proxy | Nginx |
| Containerization | Docker, Docker Compose |

---

## Architecture

```text
Client / Dashboard
        |
        v
      Nginx :80
        |
        v
  Express API :8080
        |
        +---- Authentication / JWT middleware
        +---- Rate limiter -------------------- Redis
        +---- Response cache ----------------- Redis
        |
        +---- Mongoose models ---------------- MongoDB
        |
        +---- Auth, Nodes, Connections,
              Products, Inventory, Shipments,
              Analytics routes
```

The API connects to MongoDB before starting the HTTP listener and runs the repository seeder after the database connection succeeds. Redis is used by the cache and rate-limiting middleware.

## Repository Structure

```text
Orbit-supplychainvisualizer/
├── .github/
│   └── workflows/          # GitHub Actions workflow configuration
├── config/
│   └── redis.js            # Redis client
├── middleware/
│   ├── auth.js             # JWT verification and role checks
│   ├── cache.js            # Redis response-cache middleware
│   └── rateLimiter.js      # Redis-backed request rate limiter
├── models/
│   ├── user.model.js       # User schema
│   ├── node.model.js       # Supply-chain node schema
│   ├── connection.model.js # Transport connection schema
│   ├── product.model.js    # Product schema
│   ├── inventory.model.js  # Inventory schema
│   └── shipment.model.js   # Shipment schema
├── nginx/
│   └── nginx.conf          # Reverse-proxy configuration
├── routes/
│   ├── auth.routes.js      # Registration and login
│   ├── node.routes.js      # Supply-chain nodes
│   ├── connection.routes.js# Network connections
│   ├── product.routes.js   # Products
│   ├── inventory.routes.js# Inventory operations
│   ├── shipment.routes.js # Shipment operations
│   └── analytics.routes.js# Summary analytics
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── seedData.js             # Seed records
├── seeder.js               # Database seeding logic
└── server.js               # Express app and startup
```

## Getting Started

### Prerequisites

For local development without Docker, install:

- Node.js 18 or later (a current LTS release is recommended).
- MongoDB 7 or a compatible MongoDB deployment.
- Redis 7 or a compatible Redis deployment.
- Git.

Docker Desktop or Docker Engine with the Compose plugin can be used instead.

### 1. Clone the repository

```bash
git clone https://github.com/Soubhagya003/Orbit-supplychainvisualizer.git
cd Orbit-supplychainvisualizer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the repository root. Example:

```dotenv
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/supply_chain_db
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=replace_with_a_long_random_secret
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Keep `.env` private and do not commit production credentials.

### 4. Start MongoDB and Redis

Make sure both services are running and reachable at the URLs configured in `.env`.

### 5. Start the API

Development mode (auto-restarts when files change):

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

The API listens on `http://localhost:8080` by default. A successful startup logs a MongoDB connection message and then starts the HTTP server.

Check the root endpoint:

```bash
curl http://localhost:8080/
```

Expected response:

```json
{
  "message": "Welcome to the Supply Chain Visualizer Node.js API!"
}
```

The database seeder is invoked automatically after MongoDB connects. Review `seeder.js` and `seedData.js` before running against a database that contains data you need to preserve.

---

## Environment Variables

| Variable | Purpose | Default / example |
|---|---|---|
| `PORT` | HTTP port used by Express | `8080` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/supply_chain_db` |
| `REDIS_URL` | Redis connection string | `redis://127.0.0.1:6379` locally; Compose service name may be `redis` inside Docker |
| `JWT_SECRET` | Secret used to sign and verify JWTs | Set your own strong secret |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed browser origins | `http://localhost:3000` |

**Important:** the current authentication middleware contains a development fallback secret if `JWT_SECRET` is missing. Set `JWT_SECRET` explicitly in every real deployment and consider removing the fallback before production use.

## Docker Deployment

The repository includes a Compose configuration for the API, MongoDB, Redis, and Nginx.

1. Create the `.env` file described above.
2. Build and start the services:

```bash
docker compose up --build -d
```

3. Inspect service status and logs:

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f mongo
docker compose logs -f redis
docker compose logs -f nginx
```

4. Test the API through Nginx:

```bash
curl http://localhost/
```

5. Stop the services:

```bash
docker compose down
```

To remove the persistent database/cache volumes as well (this permanently deletes the stored container data):

```bash
docker compose down -v
```

The Compose file exposes Nginx on port `80`, MongoDB on `27017`, and Redis on `6379`. The API container exposes port `8080` to the Docker network rather than publishing it directly to the host. The configured Nginx upstream determines how requests are forwarded to the API.

---

## API Reference

Base URL for local development: `http://localhost:8080`

The endpoints below reflect the route modules mounted by `server.js`. Protected write operations require a bearer token.

### Health / root

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Returns a welcome message from the API |

### Authentication — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |

Registration body:

```json
{
  "username": "demo-user",
  "email": "demo@example.com",
  "password": "replace-this-password"
}
```

Login body:

```json
{
  "username": "demo-user",
  "password": "replace-this-password"
}
```

A successful login returns a bearer token and user details. Use that token for protected operations.

### Supply-chain nodes — `/api/nodes`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/nodes` | List nodes |
| `GET` | `/api/nodes/type/:type` | Filter nodes by type |
| `GET` | `/api/nodes/status/:status` | Filter nodes by status |
| `GET` | `/api/nodes/:id` | Get a node by numeric ID |
| `POST` | `/api/nodes` | Create a node — authenticated |
| `PUT` | `/api/nodes/:id` | Update a node — authenticated |
| `DELETE` | `/api/nodes/:id` | Delete a node — authenticated |

Example create body:

```json
{
  "name": "Central Distribution Center",
  "type": "warehouse",
  "latitude": 20.2961,
  "longitude": 85.8245,
  "capacity": 10000,
  "status": "active"
}
```

### Network connections — `/api/connections`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/connections` | List connections |
| `GET` | `/api/connections/source/:sourceId` | Connections leaving a node |
| `GET` | `/api/connections/target/:targetId` | Connections entering a node |
| `GET` | `/api/connections/nodes?sourceId=1&targetId=2` | Find connections between a source and target |
| `GET` | `/api/connections/:id` | Get a connection by numeric ID |
| `POST` | `/api/connections` | Create a connection — authenticated |
| `PUT` | `/api/connections/:id` | Update a connection — authenticated |
| `DELETE` | `/api/connections/:id` | Delete a connection — authenticated |

Example create body:

```json
{
  "sourceId": 1,
  "targetId": 2,
  "transportationType": "road",
  "distance": 450,
  "travelTime": 8,
  "costPerUnit": 12.5,
  "status": "active"
}
```

### Products — `/api/products`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List products (Redis-cached) |
| `GET` | `/api/products/sku/:sku` | Find a product by SKU |
| `GET` | `/api/products/:id` | Get a product by numeric ID |
| `POST` | `/api/products` | Create a product — authenticated |

Example create body:

```json
{
  "name": "Industrial Fasteners",
  "description": "Standard steel fastener pack",
  "unitPrice": 24.99,
  "weight": 1.2,
  "sku": "FAST-001",
  "status": "active"
}
```

### Inventory — `/api/inventory`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/inventory` | List inventory with node/product names and derived status |
| `GET` | `/api/inventory/low-stock` | Find inventory at or below its minimum threshold |
| `GET` | `/api/inventory/node/:nodeId` | Inventory at a node |
| `GET` | `/api/inventory/product/:productId` | Inventory for a product across nodes |
| `GET` | `/api/inventory/:id` | Get inventory by numeric ID |
| `POST` | `/api/inventory` | Create or update inventory — authenticated |
| `DELETE` | `/api/inventory/:id` | Delete inventory — authenticated |

Example create/update body:

```json
{
  "nodeId": 1,
  "productId": 1,
  "quantity": 250,
  "minThreshold": 50,
  "maxThreshold": 800
}
```

The node and product IDs must refer to existing records. Posting an existing `(nodeId, productId)` pair updates that inventory record.

### Shipments — `/api/shipments`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shipments` | List shipments with enriched names |
| `GET` | `/api/shipments/source/:sourceId` | Filter by source node |
| `GET` | `/api/shipments/destination/:destinationId` | Filter by destination node |
| `GET` | `/api/shipments/status/:status` | Filter by shipment status |
| `GET` | `/api/shipments/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` | Filter by date range |
| `GET` | `/api/shipments/:id` | Get shipment by numeric ID |
| `POST` | `/api/shipments` | Create a shipment — authenticated |
| `PUT` | `/api/shipments/:id` | Update a shipment — authenticated |
| `DELETE` | `/api/shipments/:id` | Delete a shipment — authenticated |

The range endpoint accepts `startDate` and `endDate`. Optional `dateType` selects the date field: `departure` (default), `estimated`, or `actual`.

### Analytics — `/api/analytics`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/summary` | Calculate overall delivery and lead-time metrics |

### Example authenticated request

After login, pass the returned token in the `Authorization` header:

```bash
curl http://localhost:8080/api/nodes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

For endpoints that do not require authentication, the header can be omitted. The route handlers determine which operations are public and which require authentication.

---

## Authentication

The login endpoint returns a token with a 24-hour expiration. Send it on protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

The current role middleware recognizes `ROLE_USER`, `ROLE_ADMIN`, and `ROLE_MODERATOR` values. Protected write routes specify which roles they accept. For a production application, role assignment must be controlled by trusted server-side logic rather than accepted directly from arbitrary registration input.

## Analytics

`GET /api/analytics/summary` returns a JSON object similar in shape to:

```json
{
  "onTimeDeliveryRate": 92.5,
  "avgLeadTimeDays": 4.8,
  "exceptionRate": 7.5,
  "totalShipments": 40,
  "deliveredShipments": 32,
  "slaByLane": [
    {
      "lane": "Central Warehouse → Regional Hub",
      "slaRate": 90
    }
  ],
  "leadTimeBySegment": [
    {
      "segment": "Warehouse → Retail",
      "targetDays": 3.5,
      "actualDays": 4.1,
      "variance": "+0.6"
    }
  ]
}
```

This is an illustrative response format; actual values and lane/segment names depend on the database contents. The current implementation counts shipments with status `delayed` toward the exception rate and computes on-time performance from delivered shipments with both actual and estimated arrival dates.

## Data Model Overview

| Entity | Purpose | Key relationships / fields |
|---|---|---|
| User | API account and authorization roles | Username, email, hashed password, roles |
| Node | Facility or supply-chain location | Name, type, coordinates, capacity, status |
| Connection | Transport link between nodes | Source/target IDs, mode, distance, travel time, cost, status |
| Product | Product catalogue entry | Name, description, SKU, unit price, weight, status |
| Inventory | Quantity of a product at a node | Node ID, product ID, quantity, minimum/maximum thresholds |
| Shipment | Movement of goods between nodes | Source/destination IDs, status, dates, item list |

## Operational Notes

- The API's seeder runs on startup after a successful MongoDB connection. Check `seeder.js` before restarting the application against an existing database.
- Redis is used for product-list caching and distributed rate-limit storage. If Redis is unavailable, inspect the application logs and middleware behavior.
- The inventory status is derived when inventory data is returned; it is not necessarily stored as a permanent database field.
- Analytics are calculated from current stored shipment records. Their quality depends on the completeness and consistency of shipment statuses and date fields.
- The project currently documents the backend API; a browser-based dashboard must be provided by a separate frontend client.

## Security Considerations

Before exposing this API publicly:

1. Set a strong, unique `JWT_SECRET`; never use the development fallback in production.
2. Restrict registration so users cannot grant themselves administrator or moderator roles.
3. Validate and sanitize request bodies, query parameters, dates, IDs, and numeric values.
4. Add schema-level validation and unique constraints where appropriate (for example, usernames and SKUs).
5. Review authorization requirements for read endpoints; several data-reading routes are public in the current implementation.
6. Configure `CORS_ALLOWED_ORIGINS` to specific trusted frontend origins rather than `*`.
7. Use HTTPS at the reverse proxy and avoid exposing MongoDB/Redis ports publicly in production.
8. Use transactions or carefully designed compensating logic for multi-document shipment/inventory updates.
9. Review cache invalidation when product data changes.
10. Keep `.env` and all credentials out of version control.

## Troubleshooting

### MongoDB connection fails
- Confirm MongoDB is running.
- Check `MONGODB_URI`.
- If running inside Docker Compose, use the Compose service hostname for the database rather than `127.0.0.1`.

### Redis connection fails
- Confirm Redis is running and `REDIS_URL` points to the correct host.
- Inside Compose, use `redis://redis:6379`; from the host machine, `redis://127.0.0.1:6379` is typical.

### Browser request is blocked by CORS
- Add the exact frontend origin to `CORS_ALLOWED_ORIGINS`.
- For multiple origins, provide a comma-separated list without unexpected whitespace.

### Protected endpoint returns `401`
- Log in and use the returned JWT.
- Send `Authorization: Bearer <token>`.
- Check that the token has not expired and that the server uses the same `JWT_SECRET` for signing and verification.

### Protected endpoint returns `403`
- Confirm the token's role claims satisfy the role requirements for that endpoint.

### Seed data seems to reappear or startup changes records
- Inspect `seeder.js` to understand whether the seeder inserts, updates, or resets data before running it on a non-disposable database.

## Contributing

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes and test the affected endpoints.
4. Open a pull request with a clear description of the change.

Please do not commit secrets, `.env` files, database dumps, or real customer/supply-chain data.

## License

No license file was visible in the repository at the time this README was prepared. Unless a license is added, reuse and redistribution permissions may be limited. Add a `LICENSE` file if you intend to publish the project for reuse.
