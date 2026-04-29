# Smart Inventory & Intelligent Discount Engine - Detailed Project Documentation

## 1. Project Overview

Smart Inventory & Intelligent Discount Engine is a full-stack web application built with Next.js that implements a production-grade e-commerce system with:

- Product inventory management with category-based browsing
- User authentication and membership tiers (NORMAL, SILVER, GOLD)
- Dynamic cart management with persistent storage
- Intelligent discount calculation engine with rule-based pricing
- Order management and tracking system
- Comprehensive logging and error handling

This project is designed as an OOP-focused application demonstrating clean architecture, design patterns, and real-world business logic implementation.

---

## 2. Primary Goals

1. Build a modern full-stack application with clear code boundaries and layered architecture.
2. Demonstrate OOP concepts (Encapsulation, Inheritance, Abstraction, Polymorphism) in practical business logic.
3. Implement a rule-based discount engine with combinability constraints using Strategy Pattern.
4. Implement user authentication with NextAuth and role-based access control.
5. Keep the app deployment-ready for Neon PostgreSQL + Vercel.
6. Provide comprehensive logging and error handling for production readiness.

---

## 3. Tech Stack and Why It Was Chosen

## Frontend and Full-Stack Framework
- **Next.js (App Router)**: Server and client rendering, route organization, API routes, Vercel-first deployment.
- **React Hooks**: Local UI state and real-time interaction updates.
- **Tailwind CSS**: Fast, consistent modern UI styling with utility classes.
- **NextAuth.js**: Complete authentication solution for Next.js with session management.

## Backend and Data
- **Prisma ORM**: Type-safe and clean relational access patterns with database migrations.
- **PostgreSQL (Neon DB)**: Scalable managed relational database suited for production.
- **bcryptjs**: Password hashing for secure authentication.

## Runtime and Tooling
- **Node.js + npm scripts** for development and build workflows.
- **ESLint** to enforce code quality.
- **Prettier** for code formatting consistency.
- **Winston**: Comprehensive logging library for production-grade logging.
- **Zod**: Schema validation for API requests and data integrity.

---

## 4. Architecture (Layered Design)

The project follows strict separation of concerns with a clean layered architecture:

- `app/` - Route-level composition (UI pages + API routes)
  - `api/` - RESTful API endpoints for cart, orders, products, auth
  - `auth/` - Authentication pages (signin, signup)
  - `cart/` - Cart management page
  - `checkout/` - Checkout flow
  - `inventory/` - Product browsing page
  - `orders/` - Order history page
  - `offers/` - Active discount rules display
- `components/` - Reusable presentation + interaction units
  - ErrorBoundary (React class component for error handling)
  - CartClient, ShopClient (client-side interaction logic)
  - SiteHeader, SkeletonLoader (UI components)
- `lib/` - Domain entities and OOP abstractions
  - `models/` - Core domain classes (Product, User, Cart)
  - `discounts/` - Discount strategy hierarchy
  - `validation/` - Schema validation with Zod
  - `logging/` - Winston logger configuration
  - `auth.js` - NextAuth configuration
  - `prisma.js` - Prisma client singleton
- `services/` - Application business orchestration (DiscountEngine)
- `repositories/` - Data access layer (productRepository, cartRepository, discountRuleRepository)
- `prisma/` - Schema and seed data scripts

### Why this matters

This structure avoids tightly coupled code. UI does not directly implement pricing rules. DB queries are isolated from service logic. The decision engine remains testable and extendable. Each layer has a single responsibility, making the codebase maintainable and scalable.

---

## 5. Feature Walkthrough (User Perspective)

### Home (`/`)
- Intro/landing page describing product value.
- CTA to explore inventory.

### Authentication (`/auth/signin`, `/auth/signup`)
- User registration with email/password validation
- User type selection (NORMAL, SILVER, GOLD) during registration
- Secure login with NextAuth.js session management
- Password hashing with bcryptjs for security

### Inventory (`/inventory`)
- Product listing loaded from PostgreSQL with pagination.
- Category-based filtering and search functionality.
- Users increase/decrease quantity directly on product cards.
- Customer tier selector (`NORMAL`, `SILVER`, `GOLD`) for discount calculation.
- Real-time summary and discount explanation preview.

### Cart (`/cart`)
- Persistent cart storage in database (authenticated users).
- Editable cart with quantity controls (add, update, remove items).
- Billing summary with:
  - total,
  - discount applied,
  - final payable amount.
- Rule explanation panel for transparency.
- Optimistic UI updates for better UX.

### Checkout (`/checkout`)
- Order creation with shipping and billing address.
- Payment method selection.
- Final discount calculation before order confirmation.
- Cart clearance after successful order.

### Orders (`/orders`)
- Order history for authenticated users.
- Order status tracking (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED).
- Detailed order items with product information.

### Offers (`/offers`)
- Displays active discount rules from DB with priority and combinability metadata.
- Rule types: FESTIVAL, MEMBERSHIP, MIN_PURCHASE.

---

## 6. Database Design (Prisma + PostgreSQL)

Defined in `prisma/schema.prisma`.

## Models

### Product
- `id` (PK, CUID)
- `name`
- `price`
- `category`
- `createdAt`
- Relations: `cartItems[]`, `orderItems[]`

### User
- `id` (PK, CUID)
- `email` (unique)
- `password` (hashed with bcryptjs)
- `name`
- `type` enum: `NORMAL`, `SILVER`, `GOLD`
- `image` (optional)
- Relations: `carts[]`, `orders[]`, `accounts[]`, `sessions[]`
- NextAuth support: `Account`, `Session`, `VerificationToken` models

### DiscountRule
- `id` (PK, CUID)
- `name`
- `type` enum: `FESTIVAL`, `MEMBERSHIP`, `MIN_PURCHASE`
- `value`
- `isActive`
- `priority`
- `combinable`

### Cart
- `id` (PK, CUID)
- `userId` (FK -> User)
- Relations: `items[]`, `user`

### CartItem
- `id` (PK, CUID)
- `cartId` (FK -> Cart)
- `productId` (FK -> Product)
- `quantity`
- Relations: `cart`, `product`

### Order
- `id` (PK, CUID)
- `userId` (FK -> User)
- `status` enum: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
- `totalAmount`
- `discountAmount`
- `finalAmount`
- `shippingAddress` (JSON)
- `billingAddress` (JSON)
- `paymentMethod`
- `paymentStatus` enum: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `REFUNDED`
- Relations: `items[]`, `user`

### OrderItem
- `id` (PK, CUID)
- `orderId` (FK -> Order)
- `productId` (FK -> Product)
- `quantity`
- `price`
- Relations: `order`, `product`

## Constraints and Indices

- Composite unique: `@@unique([cartId, productId])` to prevent duplicate cart lines.
- Unique email for users: `@@unique([email])`
- Indexes on query-heavy fields:
  - `Product`: `@@index([category])`, `@@index([createdAt])`
  - `User`: `@@index([type])`, `@@index([email])`
  - `DiscountRule`: `@@index([isActive, priority])`
  - `Cart`: `@@index([userId, createdAt])`
  - `Order`: `@@index([userId, createdAt])`, `@@index([status])`
  - `CartItem`: `@@index([productId])`
  - `OrderItem`: `@@index([orderId])`, `@@index([productId])`
- Foreign key relations with proper delete behavior (Cascade, Restrict).

---

## 7. OOP Concepts Implemented (Important for Presentation)

Core domain and discount classes are in `lib/models` and `lib/discounts`. This project demonstrates OOP principles in real-world business logic.

## 7.1 Encapsulation

**Definition**: Bundling data and methods that operate on that data within a single unit (class), and restricting direct access to some of an object's components.

**Implementation in this project**:

- **Product Class** (`lib/models/Product.js`):
  - Uses private fields (`#id`, `#name`, `#price`, `#category`) to hide internal state
  - Provides getter methods for controlled access to properties
  - Ensures price is always a number through constructor validation
  ```javascript
  export class Product {
    #id;
    #name;
    #price;
    #category;

    constructor({ id, name, price, category }) {
      this.#id = id;
      this.#name = name;
      this.#price = Number(price); // Type conversion
      this.#category = category;
    }

    get id() { return this.#id; }
    get name() { return this.#name; }
    get price() { return this.#price; }
    get category() { return this.#category; }
  }
  ```

- **Cart Class** (`lib/models/Cart.js`):
  - Encapsulates cart items as private field (`#items`)
  - Provides business logic methods (`getSubtotal()`, `getTotalQuantity()`)
  - Hides internal implementation details from consumers
  ```javascript
  export class Cart {
    #items;

    constructor(items = []) {
      this.#items = items.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity)
      }));
    }

    get items() { return this.#items; }

    getSubtotal() {
      return this.#items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }

    getTotalQuantity() {
      return this.#items.reduce((sum, item) => sum + item.quantity, 0);
    }
  }
  ```

**Benefits**:
- Prevents unauthorized modification of internal state
- Allows implementation changes without affecting consumers
- Ensures data integrity through controlled access

## 7.2 Inheritance

**Definition**: Mechanism where a new class derives properties and characteristics from an existing class.

**Implementation in this project**:

- **User Hierarchy** (`lib/models/User.js`):
  - Abstract base `User` class that cannot be instantiated directly
  - Specialized child classes: `NormalUser`, `SilverUser`, `GoldUser`
  - Each child overrides `getMembershipMultiplier()` with specific behavior
  ```javascript
  export class User {
    constructor(name, type) {
      if (new.target === User) {
        throw new Error("User is abstract and cannot be instantiated directly");
      }
      this.name = name;
      this.type = type;
    }

    getMembershipMultiplier() {
      return 0;
    }
  }

  export class NormalUser extends User {
    constructor(name = "Normal User") {
      super(name, "NORMAL");
    }
  }

  export class SilverUser extends User {
    constructor(name = "Silver User") {
      super(name, "SILVER");
    }

    getMembershipMultiplier() {
      return 0.6;
    }
  }

  export class GoldUser extends User {
    constructor(name = "Gold User") {
      super(name, "GOLD");
    }

    getMembershipMultiplier() {
      return 1;
    }
  }
  ```

- **Discount Hierarchy** (`lib/discounts/Discount.js`):
  - Abstract base `Discount` class with constructor enforcement
  - Concrete implementations: `FestivalDiscount`, `MembershipDiscount`, `MinimumPurchaseDiscount`
  ```javascript
  export class Discount {
    constructor(rule) {
      if (new.target === Discount) {
        throw new Error("Discount is abstract and must be extended");
      }
      this.rule = rule;
    }

    evaluate(_context) {
      throw new Error("evaluate must be implemented in child class");
    }
  }
  ```

**Benefits**:
- Code reuse through shared base functionality
- Hierarchical organization of related concepts
- Easy extension by adding new specialized classes

## 7.3 Abstraction

**Definition**: Hiding complex implementation details and exposing only necessary features of an object.

**Implementation in this project**:

- **Abstract Discount Class**:
  - Defines the contract (`evaluate(context)` method) without implementation
  - Enforces that subclasses must implement the abstract method
  - Hides the complexity of different discount calculation strategies
  ```javascript
  export class Discount {
    constructor(rule) {
      if (new.target === Discount) {
        throw new Error("Discount is abstract and must be extended");
      }
      this.rule = rule;
    }

    evaluate(_context) {
      throw new Error("evaluate must be implemented in child class");
    }
  }
  ```

- **Abstract User Class**:
  - Cannot be instantiated directly (enforced by constructor check)
  - Provides common interface for all user types
  - Defines default behavior that can be overridden

- **Factory Pattern** (`createUserByType`):
  - Abstracts object creation logic
  - Consumers don't need to know which class to instantiate
  ```javascript
  export function createUserByType(type) {
    if (type === "GOLD") return new GoldUser();
    if (type === "SILVER") return new SilverUser();
    return new NormalUser();
  }
  ```

**Benefits**:
- Reduces complexity by hiding implementation details
- Provides clear contracts for interaction
- Allows internal changes without affecting consumers

## 7.4 Polymorphism

**Definition**: Ability of objects of different classes to be treated as objects of a common superclass, with each class implementing the same method in its own way.

**Implementation in this project**:

- **Discount Evaluation**:
  - All discount classes implement `evaluate(context)` method
  - `DiscountEngine` works with `Discount` interface, not concrete classes
  - Same method call produces different behavior based on object type
  ```javascript
  // FestivalDiscount
  evaluate({ cart }) {
    const subtotal = cart.getSubtotal();
    const percentage = Number(this.rule.value) / 100;
    const amount = subtotal * percentage;
    return { amount, label: `${this.rule.name} (${Number(this.rule.value)}% festival offer)` };
  }

  // MembershipDiscount
  evaluate({ cart, user }) {
    const subtotal = cart.getSubtotal();
    const baseRate = Number(this.rule.value) / 100;
    const actualRate = baseRate * user.getMembershipMultiplier();
    const amount = subtotal * actualRate;
    return { amount, label: `${this.rule.name} (membership multiplier ${user.getMembershipMultiplier()})` };
  }

  // MinimumPurchaseDiscount
  evaluate({ cart }) {
    const subtotal = cart.getSubtotal();
    const threshold = Number(this.rule.value);
    if (subtotal < threshold) {
      return { amount: 0, label: `${this.rule.name} skipped (requires minimum ${threshold.toFixed(2)})` };
    }
    const discountPercent = 0.12;
    const maxDiscount = 300;
    const amount = Math.min(subtotal * discountPercent, maxDiscount);
    return { amount, label: `${this.rule.name} applied (12% up to 300 after crossing ${threshold.toFixed(2)})` };
  }
  ```

- **User Membership Multiplier**:
  - Each user type implements `getMembershipMultiplier()` differently
  - Same method call returns different values based on user type
  - Discount engine uses this polymorphic behavior for calculations

**Benefits**:
- Flexible and extensible code
- New discount types can be added without modifying existing code
- Cleaner code through common interfaces

## 7.5 Design Patterns Used

### Strategy Pattern
- **Discount Classes**: Each discount type is a strategy for calculating discounts
- **DiscountEngine**: Context that uses different strategies interchangeably
- Easy to add new discount strategies without modifying the engine

### Factory Pattern
- **createUserByType()**: Factory function for creating user objects
- **createDiscount()**: Factory method in DiscountEngine for creating discount objects
- Encapsulates object creation logic

### Repository Pattern
- **Repository Classes**: Abstract data access logic from business logic
- `productRepository`, `cartRepository`, `discountRuleRepository`
- Provides clean interface for database operations

### Singleton Pattern
- **Prisma Client**: Single instance reused across the application
- **Logger**: Single Winston logger instance

---

## 8. Discount Engine Design

Implemented in `services/DiscountEngine.js`. This is the core business logic component that demonstrates OOP principles in action.

## Flow

1. Fetch active rules from repository.
2. Instantiate concrete discount strategy objects based on rule type using Factory Pattern.
3. Generate valid rule combinations using bitmask algorithm.
4. Reject invalid combinations when non-combinable constraints are violated.
5. Evaluate each valid combination using polymorphic `evaluate()` calls.
6. Select best discount outcome (maximum discount).
7. Return:
   - `total`
   - `discountApplied`
   - `finalAmount`
   - `explanation[]`

## Code Structure

```javascript
export class DiscountEngine {
  constructor({ rules }) {
    this.rules = rules;
  }

  // Factory Method Pattern
  createDiscount(rule) {
    if (rule.type === "FESTIVAL") return new FestivalDiscount(rule);
    if (rule.type === "MEMBERSHIP") return new MembershipDiscount(rule);
    if (rule.type === "MIN_PURCHASE") return new MinimumPurchaseDiscount(rule);
    return null;
  }

  // Combination generation algorithm
  generateValidCombinations(rules) {
    const combinations = [];
    const count = 1 << rules.length;

    for (let mask = 1; mask < count; mask += 1) {
      const set = [];
      for (let i = 0; i < rules.length; i += 1) {
        if (mask & (1 << i)) set.push(rules[i]);
      }

      const nonCombinables = set.filter((rule) => !rule.combinable);
      if (set.length > 1 && nonCombinables.length > 0) continue;
      combinations.push(set);
    }

    return combinations;
  }

  // Main evaluation method using polymorphism
  evaluate({ cartItems, userType }) {
    const cart = new Cart(cartItems);
    const user = createUserByType(userType);
    const total = cart.getSubtotal();

    const activeRules = this.rules
      .map((rule) => ({ ...rule, discount: this.createDiscount(rule) }))
      .filter((rule) => rule.discount);

    if (!activeRules.length) {
      return {
        total: Number(total.toFixed(2)),
        discountApplied: 0,
        finalAmount: Number(total.toFixed(2)),
        explanation: ["No active discount rules available."]
      };
    }

    const combos = this.generateValidCombinations(activeRules);
    let best = {
      discount: 0,
      explanation: ["No combination yielded positive discount."]
    };

    for (const combo of combos) {
      let discount = 0;
      const explanation = [];

      for (const rule of combo) {
        // Polymorphic call - each discount type implements evaluate differently
        const result = rule.discount.evaluate({ cart, user });
        discount += result.amount;
        explanation.push(result.label);
      }

      const boundedDiscount = Math.min(discount, total);
      if (boundedDiscount > best.discount) {
        best = {
          discount: boundedDiscount,
          explanation
        };
      }
    }

    const finalAmount = Math.max(total - best.discount, 0);

    return {
      total: Number(total.toFixed(2)),
      discountApplied: Number(best.discount.toFixed(2)),
      finalAmount: Number(finalAmount.toFixed(2)),
      explanation: [
        `Cart subtotal: ${total.toFixed(2)}`,
        ...best.explanation,
        `Best discount selected: ${best.discount.toFixed(2)}`
      ]
    };
  }
}
```

## Business Value

- Transparent pricing decisions with detailed explanations.
- Better control for business teams (rules live in DB).
- Easy extension by adding new discount class + DB rule type.
- Ensures optimal discount selection through combination evaluation.
- Supports complex business rules (combinability, thresholds, multipliers).

---

## 9. API Layer

The API layer follows RESTful principles and provides clean endpoints for client interaction. All API routes include comprehensive error handling, validation, and logging.

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
- API route validates request using Zod schemas
- Delegates to repositories for data hydration
- Fetches active discount rules
- `DiscountEngine` computes final billing outcome using OOP patterns
- Returns detailed explanation of discount calculation

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
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## `GET /api/products`
- Returns product list for inventory rendering
- Supports pagination, category filtering, and search
- Includes mock data fallback when database is not configured

### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `search`: Search in name and category

## `POST /api/auth/register`
- User registration with email/password validation
- Password hashing with bcryptjs
- User type selection (NORMAL, SILVER, GOLD)
- Returns user object without sensitive data

## `GET /api/cart`
- Fetches authenticated user's cart with product details
- Requires valid session or JWT token
- Returns cart items with full product information

## `POST /api/cart`
- Adds or updates item in user's cart
- Uses upsert operation for idempotency
- Handles concurrent cart modifications gracefully

## `DELETE /api/cart`
- Removes item from user's cart
- Requires valid session or JWT token
- Returns success response for optimistic UI updates

## `POST /api/orders`
- Creates new order from cart items
- Includes shipping/billing address and payment method
- Clears user's cart after successful order creation
- Returns order with items and product details

## `GET /api/orders`
- Fetches order history for authenticated user
- Returns orders with items and product information
- Ordered by creation date (newest first)

---

## 10. Frontend Data and State Flow

1. Server page loads products from DB and passes serializable data to client component.
2. Client component stores cart in local storage (for guest users) or database (for authenticated users).
3. On cart/userType change, frontend calls `/api/calculate`.
4. UI updates billing and explanations instantly.
5. Authenticated users have persistent cart storage in database.

This gives responsive UX without leaking core pricing logic to browser-only code.

## 11. Validation and Error Handling

### Schema Validation (Zod)
- All API requests are validated using Zod schemas in `lib/validation/schemas.js`
- Schemas include:
  - `CartItemSchema`: Validates product ID and quantity
  - `CalculateRequestSchema`: Validates discount calculation requests
  - `ProductQuerySchema`: Validates product query parameters
  - `LoginSchema`: Validates login credentials
  - `RegisterSchema`: Validates registration data
  - `RegisterWithConfirmSchema`: Registration with password confirmation
  - `CartUpdateSchema`: Validates cart update operations

### Error Handling
- Comprehensive error handling in all API routes
- Database connection errors return 503 status
- Validation errors return 400 status with detailed error messages
- Authentication errors return 401 status
- Server errors return 500 status with appropriate error details
- Development mode includes stack traces for debugging

### Error Boundary
- React Error Boundary component (`components/ErrorBoundary.js`)
- Catches React component errors gracefully
- Provides user-friendly error UI
- Logs errors to Winston logger
- Includes error details in development mode

---

## 12. Seed Data and Demo Readiness

`prisma/seed.js` provides demo-friendly sample data:
- Products across categories (Electronics, Accessories, Storage)
- Sample users by type (NORMAL, SILVER, GOLD)
- Active and inactive discount rules
- Combinable and non-combinable scenarios

This supports presentations and live demos quickly.

---

## 13. Deployment (Neon + Vercel)

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
  - Local: Set in `.env` file
  - Vercel: Set in project environment variables
- `NEXTAUTH_SECRET`: Secret key for NextAuth session encryption
- `NEXTAUTH_URL`: Base URL for NextAuth (auto-detected in production)

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
3. Add environment variables in project settings:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
4. Deploy with default Next.js build settings.
5. Run `npx prisma db push` on Vercel or use Prisma Migrate for production.

---

## 14. Non-Functional Considerations

### Maintainability
- Layered architecture and OOP abstractions improve code clarity
- Clear separation of concerns between layers
- Comprehensive logging for debugging and monitoring
- Type-safe database operations with Prisma

### Extensibility
- Add new discount type by:
  1. creating a new class extending `Discount`,
  2. updating engine mapping in `createDiscount()`,
  3. adding corresponding DB rule type
- Add new user type by extending `User` class
- Repository pattern allows easy data source changes

### Performance
- Inventory page queries DB on route render with pagination
- Database indexes on frequently queried fields
- Mock data fallback when database is unavailable
- Can be optimized with route revalidation/caching in production

### Reliability
- Server-side discount calculation ensures consistent pricing logic
- Comprehensive error handling with appropriate HTTP status codes
- Database transaction support for data integrity
- Concurrent cart modification handling

### Security
- Password hashing with bcryptjs
- NextAuth.js for secure session management
- Input validation with Zod schemas
- SQL injection prevention through Prisma ORM
- Environment variable protection for sensitive data

---

## 15. Suggested Talking Points for Project Presentation

1. "This is not a CRUD demo; it is a business decision engine with transparent pricing outputs."
2. "We separated layers intentionally: UI, repositories, service orchestration, and domain abstractions."
3. "OOP principles are implemented in real business logic, not just theory - Encapsulation, Inheritance, Abstraction, and Polymorphism are all demonstrated."
4. "The discount engine uses the Strategy Pattern for flexible discount calculation and the Factory Pattern for object creation."
5. "Rules are data-driven from DB, so business teams can change discounts without rewriting UI."
6. "The architecture is deployable and scalable with Neon + Vercel."
7. "We implemented comprehensive error handling, validation, and logging for production readiness."
8. "Authentication is handled securely with NextAuth.js and bcryptjs password hashing."

---

## 16. Future Enhancements

- Add admin panel for discount rule management
- Add unit/integration test suite for engine and APIs
- Add observability (request tracing, pricing audit logs)
- Add real-time inventory updates
- Add email notifications for order status changes
- Add payment gateway integration
- Add product reviews and ratings
- Add wishlist functionality

---

## 17. File Guide (Quick Index)

### Application Layer
- `app/` -> Routes and APIs
  - `api/calculate/route.js` -> Discount calculation endpoint
  - `api/products/route.js` -> Product listing endpoint
  - `api/cart/route.js` -> Cart CRUD operations
  - `api/orders/route.js` -> Order creation and history
  - `api/auth/register/route.js` -> User registration
  - `auth/signin/`, `auth/signup/` -> Authentication pages
  - `inventory/` -> Product browsing page
  - `cart/` -> Cart management page
  - `checkout/` -> Checkout flow
  - `orders/` -> Order history page
  - `offers/` -> Active discount rules display

### Components
- `components/ErrorBoundary.js` -> React error boundary (class component)
- `components/SiteHeader.js` -> Global navigation header
- `components/ShopClient.js` -> Inventory interactions
- `components/CartClient.js` -> Cart interactions
- `components/SkeletonLoader.js` -> Loading state component
- `components/SessionProviderWrapper.js` -> NextAuth session provider

### Domain Models (OOP Core)
- `lib/models/Product.js` -> Product class with encapsulation
- `lib/models/User.js` -> User hierarchy with inheritance
- `lib/models/Cart.js` -> Cart class with business logic

### Discount Strategies (OOP Core)
- `lib/discounts/Discount.js` -> Abstract base class
- `lib/discounts/FestivalDiscount.js` -> Festival discount strategy
- `lib/discounts/MembershipDiscount.js` -> Membership discount strategy
- `lib/discounts/MinimumPurchaseDiscount.js` -> Minimum purchase discount strategy

### Services
- `services/DiscountEngine.js` -> Pricing core logic with Strategy and Factory patterns

### Repositories (Data Access)
- `repositories/productRepository.js` -> Product data access with mock fallback
- `repositories/cartRepository.js` -> Cart hydration logic
- `repositories/discountRuleRepository.js` -> Discount rule data access

### Utilities
- `lib/validation/schemas.js` -> Zod validation schemas
- `lib/logging/logger.js` -> Winston logger configuration
- `lib/auth.js` -> NextAuth configuration
- `lib/prisma.js` -> Prisma client singleton

### Database
- `prisma/schema.prisma` -> Relational schema with all models
- `prisma/seed.js` -> Demo data setup

---

This documentation is suitable for interview walkthroughs, project presentations, and architecture discussions.
