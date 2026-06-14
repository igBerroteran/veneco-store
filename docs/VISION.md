# Vision Document: Veneco Store

Veneco Store is a lightweight, ultra-high-performance transactional e-commerce platform designed for speed, security, and rapid deployments. It serves as a blueprint and reusable template for launching tailored digital storefronts.

## 🚀 Core Value Proposition

- **Performant & Responsive**: Zero bloated dependencies. The frontend is built on Next.js 16 (App Router) combined with Vanilla CSS for precise design control, smooth layout rendering, and near-instant page loads.
- **Highly Secure Custom Auth**: Built-in cookie-based authentication using custom JSON Web Tokens (JWT) stored in secure, `HttpOnly`, `SameSite=Strict` cookies, avoiding external identity provider dependencies.
- **Turnkey Payments**: Direct integration with Stripe Checkout, supporting seamless customer redirect flows and robust backend verification.
- **Developer-Centric Closed Loop**: Ready-to-go environment configurations allowing autonomous agents (like Antigravity / Claude Code) to build, refactor, and self-correct using quality gates.

## 🎯 Target Milestones

1. **Robust Core Flow**: Secure login/registration -> interactive cart management -> checkout creation -> payment webhook/redirect.
2. **Modular Components**: Custom widgets (like `CartDrawer.tsx` and custom hooks) that can be easily repurposed for spin-off applications.
3. **Database Consistency**: Prisma-driven database schema ensuring relational integrity across Users, Products, Orders, and Order Items.
