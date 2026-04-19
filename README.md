# Smart Inventory & Intelligent Discount Engine

Production-grade Next.js application with layered architecture, OOP domain design, and a rule-based discount decision engine.

This project is designed to demonstrate real SaaS-style engineering with:
- strong separation of concerns,
- object-oriented business modeling,
- dynamic pricing through a decision engine,
- and production-friendly deployment using Neon + Vercel.

For full project walkthrough and presentation notes, read:
- `PROJECT_DOCUMENTATION.md`

## Tech Stack

- Next.js (App Router)
- React Hooks
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Neon)

## Architecture

- `app` - UI pages and API routes
  - `/` Home
  - `/inventory` Product browsing and cart building
  - `/cart` Checkout and discount outcome
  - `/offers` Active discount rule visibility
  - `/api/calculate` Billing calculation API
- `components` - reusable UI and interaction components
- `lib` - domain models and OOP abstractions
- `services` - core decision engine orchestration
- `repositories` - Prisma data access layer
- `prisma` - schema and seed data

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Set `DATABASE_URL` to your Neon PostgreSQL connection string.

3. Generate Prisma client:

```bash
npx prisma generate
```

4. Push schema:

```bash
npx prisma db push
```

5. Seed sample data:

```bash
npx prisma db seed
```

6. Run development server:

```bash
npm run dev
```

## NPM Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to DB
- `npm run prisma:seed` - Seed demo data

## API

### `POST /api/calculate`

Request body:

```json
{
  "userType": "GOLD",
  "cartItems": [
    { "productId": "prod_id", "quantity": 2 }
  ]
}
```

Response:

```json
{
  "total": 12000,
  "discountApplied": 1800,
  "finalAmount": 10200,
  "explanation": ["Cart subtotal: 12000.00", "Membership Bonus 10% ..."]
}
```

### `GET /api/products`

Returns product catalog data for inventory rendering.

## Deploy to Vercel

- Add `DATABASE_URL` in Vercel project environment variables.
- Ensure Neon allows Vercel connection.
- Deploy with default Next.js build settings.

## Notes

- Prisma requires a valid `DATABASE_URL`; missing or malformed URLs will cause app/runtime failures.
- Inventory and cart are connected using browser local storage for cart persistence.
- Discount calculations are always evaluated through the backend service layer, not on the client.
