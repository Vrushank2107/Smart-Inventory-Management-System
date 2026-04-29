# Smart Inventory & Intelligent Discount Engine

Production-grade Next.js application with layered architecture, OOP domain design, and a rule-based discount decision engine.

This project is designed to demonstrate real SaaS-style engineering with:
- strong separation of concerns,
- object-oriented business modeling (Encapsulation, Inheritance, Abstraction, Polymorphism),
- dynamic pricing through a decision engine using Strategy and Factory patterns,
- user authentication with NextAuth.js,
- order management system,
- comprehensive logging and error handling,
- and production-friendly deployment using Neon + Vercel.

**Live Demo**: https://smart-inventory-management-system-gamma.vercel.app/

For full project walkthrough and presentation notes, read:
- `PROJECT_DOCUMENTATION.md`

## Tech Stack

### Frontend & Full-Stack
- **Next.js (App Router)** - Server and client rendering, API routes
- **React Hooks** - Local UI state and real-time interactions
- **Tailwind CSS** - Modern utility-first styling
- **NextAuth.js** - Complete authentication solution

### Backend & Data
- **Prisma ORM** - Type-safe database access with migrations
- **PostgreSQL (Neon)** - Scalable managed relational database
- **bcryptjs** - Secure password hashing

### Tooling & Utilities
- **Winston** - Production-grade logging
- **Zod** - Schema validation
- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting

## Architecture

The project follows a clean layered architecture with strict separation of concerns:

### Application Layer (`app/`)
- `/` - Home landing page
- `/auth/signin` - User login
- `/auth/signup` - User registration
- `/inventory` - Product browsing with pagination and filtering
- `/cart` - Cart management with persistent storage
- `/checkout` - Order checkout flow
- `/orders` - Order history and tracking
- `/offers` - Active discount rules display

### API Routes (`app/api/`)
- `POST /api/calculate` - Discount calculation engine
- `GET /api/products` - Product listing with pagination
- `GET /api/cart` - Fetch user cart
- `POST /api/cart` - Add/update cart items
- `DELETE /api/cart` - Remove cart items
- `POST /api/orders` - Create new order
- `GET /api/orders` - Fetch order history
- `POST /api/auth/register` - User registration

### Components (`components/`)
- `ErrorBoundary` - React error boundary (class component)
- `SiteHeader` - Global navigation
- `ShopClient` - Inventory interactions
- `CartClient` - Cart interactions
- `SkeletonLoader` - Loading states
- `SessionProviderWrapper` - NextAuth session provider

### Domain Models (`lib/models/`)
- `Product` - Encapsulated product entity
- `User` - User hierarchy (NormalUser, SilverUser, GoldUser)
- `Cart` - Cart with business logic

### Discount Strategies (`lib/discounts/`)
- `Discount` - Abstract base class
- `FestivalDiscount` - Festival discount strategy
- `MembershipDiscount` - Membership discount strategy
- `MinimumPurchaseDiscount` - Minimum purchase discount strategy

### Services (`services/`)
- `DiscountEngine` - Core pricing logic with Strategy and Factory patterns

### Repositories (`repositories/`)
- `productRepository` - Product data access with mock fallback
- `cartRepository` - Cart hydration logic
- `discountRuleRepository` - Discount rule data access

### Utilities (`lib/`)
- `validation/schemas.js` - Zod validation schemas
- `logging/logger.js` - Winston logger configuration
- `auth.js` - NextAuth configuration
- `prisma.js` - Prisma client singleton

### Database (`prisma/`)
- `schema.prisma` - Complete relational schema
- `seed.js` - Demo data setup

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Set the following environment variables:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret key for NextAuth session encryption
- `NEXTAUTH_URL` - Base URL (auto-detected in production)

3. Generate Prisma client:

```bash
npx prisma generate
```

4. Push schema to database:

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

Visit `http://localhost:3000` to see the application.

## NPM Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to DB
- `npm run prisma:seed` - Seed demo data
- `npm run prisma:studio` - Open Prisma Studio

## API Endpoints

### `POST /api/calculate`

Calculates the best discount for a given cart and user type.

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
  "explanation": [
    "Cart subtotal: 12000.00",
    "Membership Bonus 10% (membership multiplier 1)",
    "Best discount selected: 1800.00"
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/products`

Returns product catalog data for inventory rendering with pagination and filtering.

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `search` - Search in name and category

### `POST /api/auth/register`

Registers a new user with email/password validation.

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "type": "GOLD"
}
```

### `GET /api/cart`

Fetches the authenticated user's cart with product details.

### `POST /api/cart`

Adds or updates an item in the user's cart.

Request body:

```json
{
  "productId": "prod_id",
  "quantity": 2
}
```

### `DELETE /api/cart`

Removes an item from the user's cart.

Request body:

```json
{
  "productId": "prod_id"
}
```

### `POST /api/orders`

Creates a new order from cart items.

Request body:

```json
{
  "items": [
    { "productId": "prod_id", "quantity": 2, "price": 1000 }
  ],
  "shippingAddress": { "street": "123 Main St", "city": "New York" },
  "billingAddress": { "street": "123 Main St", "city": "New York" },
  "paymentMethod": "credit_card",
  "totalAmount": 2000,
  "finalAmount": 1800,
  "discountAmount": 200
}
```

### `GET /api/orders`

Fetches order history for the authenticated user.

## OOP Concepts Demonstrated

This project is designed as an OOP-focused application demonstrating:

### Encapsulation
- **Product Class**: Uses private fields (`#id`, `#name`, `#price`, `#category`) with getter methods
- **Cart Class**: Encapsulates cart items and provides business logic methods (`getSubtotal()`, `getTotalQuantity()`)

### Inheritance
- **User Hierarchy**: Abstract base `User` class with specialized child classes (`NormalUser`, `SilverUser`, `GoldUser`)
- **Discount Hierarchy**: Abstract base `Discount` class with concrete implementations

### Abstraction
- **Abstract Classes**: `User` and `Discount` cannot be instantiated directly
- **Factory Pattern**: `createUserByType()` and `createDiscount()` abstract object creation

### Polymorphism
- **Discount Evaluation**: All discount classes implement `evaluate(context)` differently
- **User Multipliers**: Each user type implements `getMembershipMultiplier()` with different values

### Design Patterns
- **Strategy Pattern**: Different discount strategies for flexible pricing
- **Factory Pattern**: Object creation abstraction
- **Repository Pattern**: Data access layer abstraction
- **Singleton Pattern**: Prisma client and logger instances

## Deploy to Vercel

1. Push repository to GitHub
2. Import project in Vercel
3. Add environment variables in project settings:
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate a secure random string
4. Deploy with default Next.js build settings
5. Run `npx prisma db push` on Vercel or use Prisma Migrate for production

## Notes

- Prisma requires a valid `DATABASE_URL`; missing or malformed URLs will cause app/runtime failures
- Mock data fallback is provided when database is not configured
- Authenticated users have persistent cart storage in database
- Discount calculations are always evaluated through the backend service layer, not on the client
- All API routes include comprehensive error handling and validation
- Winston logger provides production-grade logging with file and console transports
