# DAOScope — DAO Intelligence Platform

A full-stack subscription SaaS for tracking crypto DAO tokens, governance, and news sentiment. Built with Next.js 14, Prisma, NextAuth v5, and Stripe.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth v5 (credentials + Google OAuth) |
| Database | PostgreSQL via Prisma |
| Payments | Stripe (subscriptions + webhooks) |
| Data | CoinGecko API + CryptoPanic API |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Deployment | Vercel (recommended) |

---

## Project Structure

```
dao-intelligence/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login / signup
│   ├── pricing/page.tsx            # Pricing page
│   ├── dashboard/
│   │   ├── layout.tsx              # Auth-protected layout w/ sidebar
│   │   ├── page.tsx                # Overview dashboard
│   │   ├── markets/page.tsx        # Full token market table
│   │   ├── news/page.tsx           # News & sentiment
│   │   └── settings/page.tsx       # Account & billing
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/      # NextAuth handler
│       │   └── register/           # Email registration
│       ├── stripe/
│       │   ├── checkout/           # Create Stripe checkout session
│       │   ├── portal/             # Open billing portal
│       │   └── webhook/            # Handle Stripe webhooks
│       └── data/
│           ├── daos/               # Fetch DAO token data
│           └── watchlist/          # Add/remove watchlist items
├── components/
│   └── dashboard/
│       ├── Sidebar.tsx
│       ├── DashboardClient.tsx
│       ├── MarketsClient.tsx
│       ├── NewsClient.tsx
│       └── SettingsClient.tsx
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── db.ts                       # Prisma client singleton
│   ├── api.ts                      # CoinGecko + CryptoPanic
│   ├── stripe.ts                   # Stripe helpers + webhook handler
│   └── utils.ts                    # Formatting utilities
├── types/index.ts                  # Shared TypeScript types
└── prisma/schema.prisma            # Database schema
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in:
- **DATABASE_URL** — your PostgreSQL connection string
- **AUTH_SECRET** — run `openssl rand -base64 32`
- **STRIPE_SECRET_KEY** + **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** — from Stripe dashboard
- **STRIPE_WEBHOOK_SECRET** — from `stripe listen` CLI output
- **COINGECKO_API_KEY** — free at https://www.coingecko.com/en/api
- **CRYPTOPANIC_API_KEY** — free at https://cryptopanic.com/developers/api/

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Create Stripe products

In your Stripe dashboard, create:
- **Product**: "DAOScope Pro"
  - **Price 1**: $15/month (recurring) → copy price ID to `STRIPE_PRO_MONTHLY_PRICE_ID`
  - **Price 2**: $120/year (recurring) → copy price ID to `STRIPE_PRO_YEARLY_PRICE_ID`

### 5. Run locally

```bash
npm run dev
```

### 6. Set up Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Add all `.env` variables in Vercel dashboard
4. Set `NEXT_PUBLIC_APP_URL` to your production URL
5. In Stripe dashboard → Webhooks → add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Subscription Tiers

| Feature | Free | Pro ($15/mo) |
|---|---|---|
| Watchlist tokens | 5 | 50 |
| News articles | 5 (latest) | Unlimited |
| News filters | Hot only | Hot, Rising, Bullish, Bearish |
| Sentiment analysis | Preview | Full |
| DAO token table | 5 tokens | All 20+ |
| 7-day free trial | — | ✓ |

---

## Adding More DAOs

Edit `types/index.ts` → `DAO_COINS` array. Use CoinGecko coin IDs (e.g. `"uniswap"`, `"aave"`).

---

## Extending

**Add governance data**: Integrate [Snapshot API](https://docs.snapshot.org/graphql-api) or [Tally API](https://docs.tally.xyz/) in `lib/api.ts`.

**Add treasury analytics**: Use [DeepDAO API](https://deepdao.io/) or on-chain RPC calls via `viem`.

**Add email alerts**: Wire up [Resend](https://resend.com/) or [Loops](https://loops.so/) in a cron job (`/api/cron/alerts`).

**Add CSV export**: Add a `/api/data/export` route that streams CSV from watchlist data (Pro only).
# MoonMap
