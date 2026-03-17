# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npx prisma migrate dev  # Run database migrations
npx prisma studio       # Open Prisma DB browser
```

No test framework is configured.

## Environment Setup

Copy `.env.example` to `.env.local` and populate:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — Generate with `openssl rand -base64 32`
- `HELIUS_API_KEY` — Required for NFT ownership lookups
- `COINGECKO_API_KEY` — Token market data
- `CRYPTOPANIC_API_KEY` — News feed aggregation

The app degrades gracefully without a database (session stored entirely in JWT).

## Architecture

**Next.js 14 App Router** app. Each dashboard route follows the pattern: server page component → imports a `*Client.tsx` component from `components/dashboard/` that handles client-side interactivity.

### Auth & NFT Gating

`lib/auth.ts` implements Solana wallet auth via NextAuth credentials provider:
1. Browser signs a challenge message with Phantom/Backpack/Solflare wallet
2. Server verifies signature using `tweetnacl`
3. NFT ownership checked via Helius `getAssetsByOwner` (`lib/nft.ts`)
4. Tier resolved in `lib/tiers.ts` based on Moonster NFT traits
5. Tier + trial info embedded in JWT — no DB required per request

**Tier system** (`lib/tiers.ts`):
- **Free**: No NFT, 10-minute trial
- **Tier 1**: Any Moonster NFT
- **Tier 2**: Specific traits (Coin Gecko Comet, Dark Orc Red Beard, etc.)
- **Tier 3**: "Blue Chain" trait — full governance access

NFT collection address: `9Z7JFLZikV7PYS4kffDZgUqyLZNoQNxBmyF98vx1j51L`

### Data Layer

`lib/api.ts` aggregates from:
- **CoinGecko** — DAO token prices/market data (20 tokens defined in `types/index.ts` `DAO_COINS`)
- **CryptoPanic** — News via RSS feeds; sentiment scored by keyword matching
- **DexScreener** — MROCKS token (Solana SPL: `moon3CP11XLvrAxUPBnPtueDEJvmjqAyZwPuq7wBC1y`)

`lib/subscription.ts` resolves tier features from JWT session, falling back to DB query.

### Database

Prisma + PostgreSQL. Two models:
- `User` — wallet address (unique), tier, trial start
- `WatchlistItem` — composite unique on `(userId, coinId)`

### Key Config

`next.config.mjs` whitelists CoinGecko and Pinata IPFS image domains, and sets CSP headers to allow Jupiter terminal iframes (`terminal.jup.ag`).

`dao-intelligence/` is a legacy duplicate directory — ignore it.
