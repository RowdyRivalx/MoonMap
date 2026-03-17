# MoonMap Security Report

**Agent:** CIPHER
**Date:** 2026-03-17
**Scope:** app/api/**, lib/auth.ts, lib/api.ts, next.config.mjs, .env.local, middleware.ts, prisma/schema.prisma

---

## Findings and Fixes

### 1. CRITICAL — API Key Exposed to Browser (`NEXT_PUBLIC_HELIUS_API_KEY`)
**File:** `.env.local`
**Issue:** `NEXT_PUBLIC_HELIUS_API_KEY` was set to the same value as `HELIUS_API_KEY`. Any variable prefixed `NEXT_PUBLIC_` is bundled into the client-side JavaScript and visible to anyone who loads the app. This would allow a third party to use the Helius API key for free at the project's expense.
**Fix:** Removed `NEXT_PUBLIC_HELIUS_API_KEY` from `.env.local` with an explanatory comment. All Helius calls already route through server-side code; no client-side key is needed.

---

### 2. HIGH — Gallery Route Had No Authentication
**File:** `app/api/gallery/route.ts`
**Issue:** The gallery endpoint was publicly accessible without any session check. An unauthenticated user could call it to enumerate the NFT collection or look up any wallet's Moonster holdings, consuming the Helius API quota.
**Fix:** Added `getServerSession(authOptions)` guard at the top of the handler, returning 401 for unauthenticated requests.

---

### 3. HIGH — Wallet Address Not Validated Before Use in External API Calls
**Files:** `app/api/gallery/route.ts`
**Issue:** The `wallet` query parameter was passed directly to Helius's `getAssetsByOwner` RPC call without validation. A malformed or crafted value could cause unexpected API behaviour or waste quota.
**Fix:** Added `isValidSolanaAddress()` using a strict base58 regex (`/^[1-9A-HJ-NP-Za-km-z]{32,44}$/`). Invalid addresses now return HTTP 400 before any external call is made. The same pattern is reused in lib/api.ts implicitly via session-gated routes.

---

### 4. HIGH — Watchlist Inputs Had No Validation
**File:** `app/api/data/watchlist/route.ts`
**Issue:** POST accepted `coinId`, `coinName`, and `coinSymbol` from the request body and inserted them into the database without any sanitization or length checks. An authenticated user could store arbitrary Unicode strings, very long values, or special characters.
**Fix:** Added regex-based validators:
- `coinId`: lowercase alphanumeric + hyphens, max 100 chars
- `coinName`: word chars, spaces, hyphens, dots, max 100 chars
- `coinSymbol`: alphanumeric, max 20 chars
All three are required and validated before the DB upsert. Also wrapped `req.json()` in a try/catch to gracefully handle malformed JSON.

---

### 5. MEDIUM — No Rate Limiting on Watchlist Mutations
**File:** `app/api/data/watchlist/route.ts`
**Issue:** POST and DELETE endpoints had no rate limiting. An authenticated attacker could spam them to exhaust database connection quota or cause denial of service.
**Fix:** Added a simple in-memory rate limiter (30 requests per user per minute) for POST and DELETE. Returns HTTP 429 when exceeded.

---

### 6. MEDIUM — No Rate Limiting on Search Endpoint
**File:** `app/api/data/search/route.ts`
**Issue:** The CoinGecko search proxy had no rate limiting. Authenticated users could hammer it to exhaust the CoinGecko API key's rate limit.
**Fix:** Added in-memory rate limiter (60 requests per user per minute). Also added query validation: max 100 chars, restricted to `[\w\s\-\.]{2,100}` pattern, returning empty results for suspicious inputs.

---

### 7. MEDIUM — Watchlist GET Response Leaked Internal `userId`
**File:** `app/api/data/watchlist/route.ts`
**Issue:** `findMany` returned full database rows including the internal `userId` (a CUID). While not a catastrophic leak, returning internal IDs is unnecessary and adds surface area.
**Fix:** Destructured `userId` out before returning items to the client in both GET and POST responses.

---

### 8. MEDIUM — No Middleware for Route Protection
**File:** `middleware.ts` (did not exist)
**Issue:** There was no Next.js middleware enforcing auth at the edge. Each API route individually checked the session, but dashboard pages had no edge-level protection.
**Fix:** Created `middleware.ts` using `withAuth` from `next-auth/middleware`. It protects `/dashboard/**`, `/api/data/**`, and `/api/gallery`. The NextAuth handler at `/api/auth/**` is intentionally excluded.

---

### 9. MEDIUM — Missing HTTP Security Headers
**File:** `next.config.mjs`
**Issue:** The existing CSP was present, but several important security headers were missing: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`.
**Fix:** Added all five headers to the global headers block:
- `X-Frame-Options: SAMEORIGIN` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing attacks
- `Referrer-Policy: strict-origin-when-cross-origin` — limits referrer leakage
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — disables unneeded browser APIs
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — enforces HTTPS

---

### 10. LOW — Verbose Auth Logging Leaking Wallet Addresses
**File:** `lib/auth.ts`
**Issue:** The `authorize` callback logged the full wallet address, signature validity, and NFT result to stdout on every login. In a production environment with aggregated logs, this constitutes unnecessary PII logging.
**Fix:** Removed `console.log` statements that emitted wallet addresses. Kept error-level logs but stripped the wallet value from them.

---

## Items Reviewed — No Action Required

- **Prisma schema** (`prisma/schema.prisma`): No raw SQL queries found. All queries use the Prisma ORM safely. Schema uses CUID primary keys and a unique constraint on `(userId, coinId)` preventing duplicate watchlist entries.
- **lib/api.ts**: API keys (`HELIUS_API_KEY`, `COINGECKO_API_KEY`) are only read server-side via `process.env` and are never returned in any response payload. No NEXT_PUBLIC exposure in this file.
- **Signature replay protection** (`lib/auth.ts`): A 5-minute timestamp window is already enforced on signed auth messages.
- **CSRF**: All mutation endpoints use POST/DELETE (not GET). Next.js App Router provides CSRF protection for same-origin cookie-based sessions.
- **SQL injection**: Prisma ORM is used throughout; no `$queryRaw` with user-controlled input was found except the health-check `SELECT 1` which is static.
- **Auth on daos/trending routes**: Both already had `getServerSession` guards returning 401.

---

*Signed: CIPHER*
