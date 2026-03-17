# MoonMap

**Solana DAO intelligence for Moonsters NFT holders.**

Live at [moonmap.net](https://moonmap.net) · Built by [@ROWDY](https://x.com/moonsters_io)

---

## What it is

MoonMap is a real-time dashboard for the [Moonsters](https://moonsters.io) community on Solana. It tracks DAO governance tokens, live market data, portfolio holdings, news sentiment, and community discussion — all gated by NFT ownership. No subscriptions. No logins beyond your wallet. Hold a Moonster, get access.

---

## Access tiers

| Tier | Requirement | Watchlist | News | Features |
|------|-------------|-----------|------|----------|
| **Trial** | Any wallet | 5 tokens | 5 articles | 10-minute free trial |
| **Astronaut** | Any Moonster NFT | 20 tokens | 20 articles | Full markets, portfolio |
| **Moon Walker** | Rare trait | 50 tokens | 100 articles | Full sentiment, filters |
| **MOONSTER** | Blue Chain trait | Unlimited | Unlimited | Governance + treasury analytics |

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router, RSC) |
| Auth | NextAuth v4 — Solana wallet signature (Ed25519 / tweetnacl) |
| Database | PostgreSQL via Prisma ORM (Supabase) |
| Blockchain | Helius RPC — NFT detection + wallet token balances |
| Market data | CoinGecko API — prices, charts, market caps |
| News | CryptoPanic API + 18 RSS feeds |
| Charts | Recharts (AreaChart) |
| Styling | Tailwind CSS + custom glass morphism CSS |
| Deployment | Vercel (auto-deploy from `main`) |

---

## Project structure

```
MoonMap/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── login/page.tsx                # Wallet connect + sign
│   ├── pricing/page.tsx              # Tier comparison + FAQ
│   └── dashboard/
│       ├── layout.tsx                # Auth-protected shell + sidebar
│       ├── page.tsx                  # Overview: $MROCKS chart, movers, ticker
│       ├── markets/page.tsx          # Full token table (46 Solana DAOs)
│       ├── portfolio/page.tsx        # Wallet holdings (SPL tokens + NFTs)
│       ├── watchlist/page.tsx        # Saved tokens with price alerts
│       ├── news/page.tsx             # Aggregated news + sentiment
│       ├── gallery/page.tsx          # Moonster NFT viewer
│       ├── mrocks/page.tsx           # $MROCKS deep dive
│       ├── token/[id]/page.tsx       # Token detail: charts, news, community
│       └── settings/page.tsx         # Account info
├── app/api/
│   ├── auth/[...nextauth]/           # NextAuth handler
│   ├── data/daos/                    # DAO token list endpoint
│   ├── data/watchlist/               # Watchlist CRUD
│   ├── data/trending/                # Top movers endpoint
│   ├── data/search/                  # Token search
│   └── gallery/                      # NFT gallery data
├── components/dashboard/
│   ├── Sidebar.tsx                   # Nav sidebar (mobile drawer + desktop)
│   ├── DashboardClient.tsx           # Overview page client
│   ├── MarketsClient.tsx             # Sortable markets table
│   ├── PortfolioClient.tsx           # Wallet holdings display
│   ├── WatchlistClient.tsx           # Watchlist with localStorage fallback
│   ├── NewsClient.tsx                # News feed + sentiment bar
│   ├── TokenDetailClient.tsx         # Token detail charts + community tab
│   ├── SwapPanel.tsx                 # Jupiter swap integration
│   └── TrialBanner.tsx               # Countdown trial banner
├── lib/
│   ├── auth.ts                       # NextAuth config + wallet sig verification
│   ├── api.ts                        # All external API calls (CoinGecko, Helius, etc.)
│   ├── nft.ts                        # Moonster NFT ownership detection
│   ├── tokens.ts                     # Solana mint address mappings
│   ├── tiers.ts                      # Feature flags per tier
│   ├── moonsters.ts                  # Moonster trait → tier logic
│   ├── db.ts                         # Prisma client singleton
│   └── utils.ts                      # Formatting helpers
├── types/index.ts                    # Shared TypeScript types + DAO_COINS list
├── prisma/schema.prisma              # User + WatchlistItem schema
├── middleware.ts                     # Edge auth guard (requires NEXTAUTH_SECRET)
└── next.config.mjs                   # Security headers + image domains
```

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/RowdyRivalx/MoonMap.git
cd MoonMap
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
# Database (Supabase or any PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Auth
AUTH_SECRET="run: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# Helius — NFT detection + wallet token balances
# Free tier: 100k req/month — https://helius.dev
HELIUS_API_KEY="your-key"

# CoinGecko — market data
# Free tier works, demo key increases rate limits — https://coingecko.com/api
COINGECKO_API_KEY="your-key"

# CryptoPanic — news + sentiment
# Free at https://cryptopanic.com/developers/api/
CRYPTOPANIC_API_KEY="your-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Connect any Solana wallet to get a 10-minute trial.

---

## Vercel deployment

1. Push to GitHub
2. Import repo in Vercel
3. Add all environment variables in **Settings → Environment Variables**:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXTAUTH_SECRET` ← same value as `AUTH_SECRET`, required for edge middleware
   - `NEXTAUTH_URL` → `https://yourdomain.com`
   - `HELIUS_API_KEY`
   - `COINGECKO_API_KEY`
   - `CRYPTOPANIC_API_KEY`
4. Deploy — Vercel auto-deploys on every push to `main`

> **Note:** Both `AUTH_SECRET` and `NEXTAUTH_SECRET` must be set for the edge auth middleware (`middleware.ts`) to work correctly. If you only set one, the middleware will throw a `NO_SECRET` error and redirect all protected routes to `/login?error=Configuration`.

---

## How wallet auth works

1. User connects a Solana wallet (Phantom, Backpack, Solflare, etc.)
2. App requests a signature on a timestamped message
3. Server verifies the Ed25519 signature using `tweetnacl` + `@solana/web3.js`
4. Helius RPC checks the wallet for Moonster NFTs
5. NFT traits determine the access tier, stored in the JWT session
6. Tier is re-checked on each login — no stale access if NFT is sold

MoonMap never takes custody of any assets. Read-only signature only.

---

## Adding tokens

Edit `types/index.ts` → `DAO_COINS` array. Use CoinGecko coin IDs (e.g. `"jupiter-exchange-solana"`).

If the token is a Solana SPL token, add its mint address to `lib/tokens.ts` → `COIN_TO_MINT` so wallet balance detection works.

---

## Data sources

| Source | Used for | Refresh |
|--------|----------|---------|
| CoinGecko | Token prices, market caps, charts, metadata | 60s |
| Helius RPC | NFT ownership, wallet SPL token balances | On login / on-demand |
| CryptoPanic | Crypto news, sentiment votes | 300s |
| 18 RSS feeds | Broader news corpus | 300s |
| DexScreener | $MROCKS price + 24h change | 300s |
| Reddit JSON API | Community discussion posts | 300s |

---

## Security

- Wallet signatures verified server-side (Ed25519, 5-minute replay window)
- All API routes auth-gated via `getServerSession`
- Edge middleware (`middleware.ts`) blocks unauthenticated access to `/dashboard` before page load
- Input validation on all user-supplied fields (wallet addresses, watchlist entries)
- Rate limiting: watchlist mutations 30 req/min, search 60 req/min
- No API keys exposed client-side (`NEXT_PUBLIC_HELIUS_API_KEY` removed)
- Security headers: `X-Frame-Options`, `HSTS`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
