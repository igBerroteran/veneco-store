# Veneco Store Stack: Reusable Architecture & Code Reference

This document serves as a reusable template and architectural blueprint for spin-offs and similar e-commerce/transactional web applications. It uses a modern, high-performance, and secure Next.js stack integrated with database persistence, custom authentication, and Stripe payments.

---

## 🛠️ Core Technology Stack

- **Framework**: Next.js (App Router, Turbopack)
- **Database ORM**: Prisma Client
- **Databases**: PostgreSQL (Production, e.g., Neon serverless) / SQLite (Local development option)
- **Authentication**: JWT-based session tokens stored in secure HTTP-only cookies
- **Payment Processing**: Stripe Node SDK & Stripe Checkout
- **Styling**: Vanilla CSS for maximum performance and design control

---

## 📂 File Structure & Key Paths

```text
├── prisma/
│   ├── schema.prisma           # Database models (User, Product, Order, OrderItem)
│   ├── seed.js                 # Database seed script for initial roles & assets
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── dashboard/      # Admin Panel (Sales Metrics, Order Management, Catalog edit)
│   │   ├── api/
│   │   │   ├── auth/           # Login, logout, register, me endpoints
│   │   │   ├── checkout/       # Stripe Checkout session creation endpoint
│   │   │   └── products/       # Product catalog CRUD endpoints
│   │   ├── dashboard/          # Client Area (Order tracking, progress tracker)
│   ├── components/
│   │   └── CartDrawer.tsx      # Sidebar cart & Shipping Address form
│   ├── context/
│   │   └── CartContext.tsx     # State management for cart items & operations
│   ├── lib/
│   │   ├── auth.ts             # JWT token sign/verify & server-side session helpers
│   │   └── db.ts               # PrismaClient instance exports
```

---

## ⚙️ Environment Variables (`.env`)

Template for configuration:

```env
# Database Configuration (PostgreSQL / Neon)
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"

# JWT configuration for Admin & Client Auth
JWT_SECRET="use-a-strong-custom-secret-key-here"

# Stripe Keys (Always match public/private key pairs!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_... or pk_test_..."
STRIPE_SECRET_KEY="sk_live_... or sk_test_..."

# Next.js App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Root Admin Credentials for Seed Script
ROOT_ADMIN_EMAIL="admin@domain.com"
ROOT_ADMIN_PASSWORD="secure-password"
```

---

## 💳 Stripe Integration Best Practices

### 1. Robust Initialization
Always omit hardcoded `apiVersion` unless you are sure of matching dependency compatibility. Initializing without `apiVersion` dynamically falls back to the Stripe Account's API version configured in the dashboard:

```typescript
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const isMockStripe = STRIPE_SECRET_KEY.includes('MockSecretKeyHere') || !STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (!isMockStripe) {
  try {
    stripe = new Stripe(STRIPE_SECRET_KEY);
  } catch (err) {
    console.error('Error al inicializar Stripe:', err);
  }
}
```

### 2. User Existence Validation
When creating a transaction linked to a user, check that the user ID exists in the database to avoid foreign key constraint violations if the database is reset or if stale cookies are present:

```typescript
let userId: string | null = null;
if (session?.id) {
  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true },
  });
  if (dbUser) {
    userId = session.id;
  }
}

const order = await prisma.order.create({
  data: {
    userId,
    // ...other order properties
  }
});
```

---

## 🖼️ Base64 Image Upload to Database

To support custom product photos without complex cloud storage (like AWS S3 or Cloudinary) during rapid prototyping or small catalog deployments:

1. **Client-side File Reader (Base64 conversion)**:
   ```typescript
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       const reader = new FileReader();
       reader.onloadend = () => {
         setUploadedImageBase64(reader.result as string); // Stores "data:image/png;base64,iVBORw..."
       };
       reader.readAsDataURL(file);
     }
   };
   ```
2. **Server-side Storage**:
   Prisma translates the `image String` model attribute to a `TEXT` field in PostgreSQL/SQLite. This fits Base64 strings with zero configuration.
3. **Rendering**:
   React `<img src={product.image} />` naturally supports rendering Base64 data URLs out-of-the-box.
