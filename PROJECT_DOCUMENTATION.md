# Smart Inventory & Intelligent Discount Engine - Detailed Project Documentation

## 1. Project Overview

Smart Inventory & Intelligent Discount Engine is a full-stack web application built with Next.js that simulates a real-world e-commerce pricing workflow:

- users browse products from inventory,
- build carts with dynamic quantity changes,
- select user membership tier,
- and receive the best discount outcome from a rule engine.

This project emphasizes production architecture patterns over basic CRUD and demonstrates clean layering, OOP design, and business-rule evaluation.

---

## 2. Primary Goals

1. Build a modern full-stack application with clear code boundaries.
2. Demonstrate OOP concepts in practical business logic.
3. Implement a rule-based discount engine with combinability constraints.
4. Keep the app deployment-ready for Neon PostgreSQL + Vercel.

---

## 3. Tech Stack and Why It Was Chosen

## Frontend and Full-Stack Framework
- **Next.js (App Router)**: Server and client rendering, route organization, API routes, Vercel-first deployment.
- **React Hooks**: Local UI state and real-time interaction updates.
- **Tailwind CSS**: Fast, consistent modern UI styling with utility classes.

## Backend and Data
- **Prisma ORM**: Type-safe and clean relational access patterns.
- **PostgreSQL (Neon DB)**: Scalable managed relational database suited for production.

## Runtime and Tooling
- **Node.js + npm scripts** for development and build workflows.
- **ESLint** to enforce code quality.

---

## 4. Architecture (Layered Design)

The project follows strict separation of concerns:

- `app/` - Route-level composition (UI pages + API routes)
- `components/` - Reusable presentation + interaction units
- `lib/` - Domain entities and OOP abstractions
- `services/` - Application business orchestration (DiscountEngine)
- `repositories/` - Data access to Prisma/database
- `prisma/` - Schema and seed data scripts

### Why this matters

This structure avoids tightly coupled code. UI does not directly implement pricing rules. DB queries are isolated from service logic. The decision engine remains testable and extendable.

---

## 5. Feature Walkthrough (User Perspective)

### Home (`/`)
- Intro/landing page describing product value.
- CTA to explore inventory.

### Inventory (`/inventory`)
- Product listing loaded from PostgreSQL.
- Users increase/decrease quantity directly on product cards.
- Customer tier selector (`NORMAL`, `SILVER`, `GOLD`).
- Real-time summary and discount explanation preview.

### Cart (`/cart`)
- Editable cart with quantity controls.
- Billing summary with:
  - total,
  - discount applied,
  - final payable amount.
- Rule explanation panel for transparency.

### Offers (`/offers`)
- Displays active discount rules from DB with priority and combinability metadata.

---

## 6. Database Design (Prisma + PostgreSQL)

Defined in `prisma/schema.prisma`.

## Models

### Product
- `id` (PK)
- `name`
- `price`
- `category`
- `createdAt`

### User
- `id` (PK)
- `name`
- `type` enum: `NORMAL`, `SILVER`, `GOLD`

### DiscountRule
- `id` (PK)
- `name`
- `type` enum: `FESTIVAL`, `MEMBERSHIP`, `MIN_PURCHASE`
- `value`
- `isActive`
- `priority`
- `combinable`

### Cart
- `id`
- `userId` (FK -> User)
- relation to items

### CartItem
- `id`
- `cartId` (FK -> Cart)
- `productId` (FK -> Product)
- `quantity`

## Constraints and Indices

- Composite unique: `@@unique([cartId, productId])` to prevent duplicate cart lines.
- Indexes on query-heavy fields (e.g., active rule filtering and cart lookups).
- Foreign key relations with proper delete behavior.

---

## 7. OOP Concepts Implemented (Important for Presentation)

Core domain and discount classes are in `lib/models` and `lib/discounts`.

## 7.1 Encapsulation

- Domain classes own their data and behavior.
- Example:
  - `Product` class encapsulates product properties.
  - `Cart` encapsulates subtotal and quantity calculations.
- Consumers use public methods rather than directly mutating internal behavior.

## 7.2 Inheritance

- Base `User` class with specialized child classes:
  - `NormalUser`
  - `SilverUser`
  - `GoldUser`
- Each child can customize membership behavior through overridden methods.

## 7.3 Abstraction

- `Discount` is an abstract base class defining the `evaluate(context)` contract.
- Concrete discount strategies implement this contract differently.

## 7.4 Polymorphism

- `FestivalDiscount`, `MembershipDiscount`, `MinimumPurchaseDiscount` all expose `evaluate(...)`.
- `DiscountEngine` works with them through a shared interface, regardless of concrete type.

---

## 8. Discount Engine Design

Implemented in `services/DiscountEngine.js`.

## Flow

1. Fetch active rules from repository.
2. Instantiate concrete discount strategy objects based on rule type.
3. Generate valid rule combinations.
4. Reject invalid combinations when non-combinable constraints are violated.
5. Evaluate each valid combination.
6. Select best discount outcome.
7. Return:
   - `total`
   - `discountApplied`
   - `finalAmount`
   - `explanation[]`

## Business Value

- Transparent pricing decisions.
- Better control for business teams (rules live in DB).
- Easy extension by adding new discount class + DB rule type.

---

## 9. API Layer

## `POST /api/calculate`

### Input
```json
{
  "userType": "GOLD",
  "cartItems": [
    { "productId": "abc123", "quantity": 2 }
  ]
}
```

### Processing
- API route delegates to repositories + service layer.
- Product references are hydrated.
- Rules are fetched.
- `DiscountEngine` computes final billing outcome.

### Output
```json
{
  "total": 12000,
  "discountApplied": 1800,
  "finalAmount": 10200,
  "explanation": [
    "Cart subtotal: 12000.00",
    "Membership Bonus 10% (membership multiplier 1)",
    "Best discount selected: 1800.00"
  ]
}
```

## `GET /api/products`
- Returns product list for inventory rendering.

---

## 10. Frontend Data and State Flow

1. Server page loads products from DB and passes serializable data to client component.
2. Client component stores cart in local storage.
3. On cart/userType change, frontend calls `/api/calculate`.
4. UI updates billing and explanations instantly.

This gives responsive UX without leaking core pricing logic to browser-only code.

---

## 11. Seed Data and Demo Readiness

`prisma/seed.js` provides demo-friendly sample data:
- products across categories,
- sample users by type,
- active and inactive discount rules,
- combinable and non-combinable scenarios.

This supports presentations and live demos quickly.

---

## 12. Deployment (Neon + Vercel)

## Environment
- `DATABASE_URL` required in:
  - local `.env`
  - Vercel project environment variables

## Local commands
```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

## Vercel checklist
1. Push repository to GitHub.
2. Import project in Vercel.
3. Add `DATABASE_URL` in project settings.
4. Deploy.

---

## 13. Non-Functional Considerations

### Maintainability
- Layered architecture and OOP abstractions improve code clarity.

### Extensibility
- Add new discount type by:
  1. creating a new class extending `Discount`,
  2. updating engine mapping,
  3. adding corresponding DB rule type.

### Performance
- Inventory page currently queries DB on route render.
- Can be optimized with route revalidation/caching in production.

### Reliability
- Server-side discount calculation ensures consistent pricing logic.

---

## 14. Suggested Talking Points for Project Presentation

1. "This is not a CRUD demo; it is a business decision engine with transparent pricing outputs."
2. "We separated layers intentionally: UI, repositories, service orchestration, and domain abstractions."
3. "OOP principles are implemented in real logic, not just theory."
4. "Rules are data-driven from DB, so business teams can change discounts without rewriting UI."
5. "The architecture is deployable and scalable with Neon + Vercel."

---

## 15. Future Enhancements

- Add authentication and per-user persistent carts.
- Add admin panel for discount rule management.
- Add unit/integration test suite for engine and APIs.
- Add observability (request tracing, pricing audit logs).
- Add pagination/search/filter on inventory.

---

## 16. File Guide (Quick Index)

- `app/` -> routes and APIs
- `components/SiteHeader.js` -> global nav header
- `components/ShopClient.js` -> inventory interactions
- `components/CartClient.js` -> cart interactions
- `services/DiscountEngine.js` -> pricing core logic
- `repositories/*.js` -> DB access
- `lib/models/*.js` -> domain models
- `lib/discounts/*.js` -> discount strategy hierarchy
- `prisma/schema.prisma` -> relational schema
- `prisma/seed.js` -> demo data setup

---

This documentation is suitable for interview walkthroughs, project presentations, and architecture discussions.
