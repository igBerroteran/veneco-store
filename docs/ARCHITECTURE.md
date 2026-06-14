# Architecture Reference: Veneco Store

This document outlines the technical design, directory layout, and design conventions used across the Veneco Store codebase.

---

## 🛠️ Stack Overview

- **Framework**: Next.js 16 (App Router, React 19, TSX)
- **Database Access**: Prisma ORM (Prisma Client)
- **Databases**: PostgreSQL (Neon for production) / SQLite (for fast local development and testing)
- **Authentication**: JWT-based session tokens stored in secure, `HttpOnly` cookies
- **Payment Gateway**: Stripe Node SDK & Stripe Checkout
- **Styling**: Vanilla CSS (`src/app/globals.css` and CSS Modules) for peak performance

---

## 📂 Core Folder Structure

```text
├── prisma/
│   ├── schema.prisma           # Database schema & models (User, Product, Order, OrderItem)
│   ├── seed.js                 # Seed script with default users & mock inventory
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── dashboard/      # Admin Panel (Metrics, Order list, Catalog Editor)
│   │   ├── api/
│   │   │   ├── auth/           # Login, logout, register, me endpoints
│   │   │   ├── checkout/       # Stripe checkout session generation
│   │   │   └── products/       # Products catalog CRUD endpoints
│   │   ├── dashboard/          # Customer portal (Order tracking & history)
│   ├── components/
│   │   └── CartDrawer.tsx      # Slide-out shopping cart & shipping fields
│   ├── context/
│   │   └── CartContext.tsx     # Cart global state (React Context)
│   ├── lib/
│   │   ├── auth.ts             # JWT cryptography & cookie signing helpers
│   │   └── db.ts               # Shared PrismaClient initialization
```

---

## 🔒 Key Design Patterns

### JWT Cookie Auth
Authentication is stateless on the server but secured on the client via HTTP-Only cookies. JWTs contain the user's ID, role, and email. Check `src/lib/auth.ts` for:
- `signJWT(payload)`
- `verifyJWT(token)`
- Cookie headers configuration: `HttpOnly`, `Secure`, `SameSite=Strict`.

### Safe Stripe Integration
We avoid hardcoding Stripe API versions to prevent breaks during SDK upgrades.
- Checks if Stripe Secret Key is a mock or missing to degrade gracefully during local/offline development.
- Validates the User's existence in the database prior to creating orders to prevent foreign-key orphaned records.

### Image Storage
Products support Base64 data URLs stored directly as `TEXT` in the database. This eliminates the need for S3/Cloudinary bucket configuration during early development.
