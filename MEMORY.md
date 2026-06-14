# Loop Persistent Memory (MEMORY.md)

This file tracks attempts, facts verified, and items currently open for future loops. It prevents the loop agents from repeating past errors.

---

## 🧪 PROBADO (Attempts & Experiments)

- **Intento 01 (2026-06-13):** Created `.antigravity/` configurations, `.claudecode/` configs, and `docs/` core instructions to establish a closed-loop environment.
- **Intento 02 (2026-06-13):** Ran `npm run lint` and found 39 errors and 26 warnings.
- **Intento 03 (2026-06-13):** Implemented the JWT token refresh flow (`/api/auth/refresh`) and resolved all 39 linting errors.
- **Intento 04 (2026-06-13):** Ran build validation (`npm run build`). The project compiled successfully in turbopack production mode and all TypeScript checks passed.

---

## 🔍 VERIFICADO (Confirmed Facts)

- **Linter & Build**: The linter uses `eslint` (`npm run lint`), which returns 0 errors now. The build command `npm run build` runs `prisma generate && next build` and completes successfully.
- **Token Refresh**: The auth system utilizes a dual cookie configuration:
  - `token`: Access token (expires in 1 hour).
  - `refreshToken`: Refresh token (expires in 7 days).
  - Both cookies are Http-Only, Secure (in production), and SameSite=Strict.
  - Endpoint `/api/auth/refresh` (POST) handles client requests to refresh access tokens.
  - Endpoint `/api/auth/logout` (POST) clears both cookies.

---

## 📌 ABIERTO (Current Tasks & Next Steps)

- [ ] Set up integration tests (e.g., configuring Vitest or Playwright) to add automated integration testing gates to loops.
- [ ] Add sliding session refresh triggers on the frontend side if the access token cookie is close to expiration.
