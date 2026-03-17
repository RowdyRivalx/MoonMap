# MOONMAP — Product Vision & Strategic Plan

**Version:** 1.0
**Date:** March 17, 2026
**Author:** @ROWDY

---

## Executive Summary

MoonMap is a Solana-native DAO intelligence dashboard built exclusively for the Moonsters NFT community. It is the only platform on Solana where your NFT is your subscription — no credit cards, no paywalls, no monthly fees. Wallet signature in, trait detected, tier granted. Permanent access for as long as you hold.

The foundation is solid. We have:
- A functioning Next.js 14 App Router application with server-side rendering and ISR
- Cryptographic Solana wallet auth (tweetnacl signature verification) with 10-minute free trial for non-holders
- Four NFT-trait-gated access tiers (Free / Astronaut / Moon Walker / MOONSTER) resolved from Helius DAS
- Live market data from CoinGecko covering 20 DAO governance tokens, with sparklines and 7d/24h deltas
- $MROCKS (Moonsters 404 token) as a featured hero asset with DexScreener pricing and a 1H/7D/1M chart
- Integrated Jupiter DEX swap panel (slide-out, in-app) for every tracked token
- A portfolio tracker that auto-detects wallet balances via Helius DAS + Jupiter price fallback, including SOL and SPL dust
- A full NFT gallery browsing all 10,000 Moonsters with pagination, tier filters, and hover trait reveals
- News aggregation from 18 RSS feeds with keyword-based sentiment scoring
- A community leaderboard showing all connected users ranked by tier and watchlist depth
- A watchlist with localStorage-first writes that sync to Postgres asynchronously (DB-optional architecture)
- A clean, deeply branded dark space UI with neon palette, holographic animations, and Moonsters character art throughout

The product works. But it is not yet the undeniable #1 dashboard in the Moonsters ecosystem. The gaps are strategic, not cosmetic.

**The core strategic insight:** MoonMap's moat is the NFT-gating mechanic. No competitor on Solana has tied dashboard features directly to on-chain NFT traits. This is a defensible primitive. Our job now is to make the gated features so valuable that holding a higher-tier Moonster is financially and informationally meaningful — not just a badge.

**Target user:** Active Moonsters NFT holder who also participates in DeFi on Solana and follows on-chain governance. They currently use Birdeye for price tracking, Snapshot for governance, and Twitter for alpha. We want to replace all three tabs with MoonMap.

---

## Top 10 Highest-Impact Improvements — Implement NOW

These are ordered by impact-to-effort ratio. Items 1-5 are the "foundation" sprint. Items 6-10 are the "moat" sprint.

---

### 1. Real-Time On-Chain Governance Feed (Snapshot + Realms)

**Current state:** The features object has `governanceAlerts: true` for tier3, but there is zero governance data anywhere in the app. The governance tracker on the landing page is pure marketing copy with no backing implementation. This is the single biggest credibility gap.

**What to build:**
- Integrate Snapshot GraphQL API (`https://hub.snapshot.org/graphql`) to pull active proposals for all 20 tracked DAO tokens
- Integrate Realms API for Solana-native governance (Marinade, Mango, etc.)
- Add a `Governance` dashboard section (new sidebar item) showing: proposal title, status (active/passed/failed/pending), vote deadline countdown, quorum progress bar, and yes/no vote split
- For tier3 (MOONSTER), add real-time push-style alerts: badge dot on sidebar, toast notification on new proposal
- For tier2 (Moon Walker), show read-only governance feed without alerts

**Why #1:** This is the only feature class that no Solana price dashboard (Birdeye, Step, AssetDash) does well. It is the literal definition of "DAO intelligence" and currently missing entirely. Every time a tier3 user logs in and sees empty governance cards, we lose trust.

---

### 2. Treasury Analytics Dashboard (Tier3 Gate)

**Current state:** `treasuryAnalytics: true` is set for tier3 in `TIER_FEATURES` but the feature does not exist in any page, route, or component. Again, pure dead configuration.

**What to build:**
- Integrate DeepDAO API or direct on-chain RPC for top DAOs' treasury wallet addresses
- Show per-DAO treasury: total USD value, asset breakdown (pie chart), 30-day inflow/outflow, runway estimate at current burn rate
- Add a Treasury tab within each Token Detail page (`/dashboard/token/[id]`)
- Add a summary widget on the main MOONSTER dashboard Overview showing combined treasury health of all watched DAOs

**Why #2:** Treasury health is the single most important on-chain signal for DAO token price action. This is data that Birdeye does not show, DeFiLlama shows incompletely, and Step Finance does not show at all. It is a genuine information edge for MOONSTER holders.

---

### 3. Upgrade $MROCKS Chart to Real Candlestick Data

**Current state:** The 1H, 7D, and 1M charts in `MROCKSClient.tsx` and the 24h chart in `DashboardClient.tsx` generate fabricated price history using linear interpolation plus random noise from the current DexScreener price and percentage change. This is cosmetic data, not real data. If a user screenshots a spike, that spike is a lie.

**What to build:**
- Replace `getMROCKSHistoryAll()` in `lib/api.ts` with Birdeye public API OHLCV endpoint: `GET /defi/history_price?address={mint}&address_type=token&type=1m` (no API key required for public data)
- Fall back to DexScreener `/candlesticks` if Birdeye is unavailable
- Add candlestick (OHLC) chart option in addition to area chart using a lightweight charting library or extending Recharts with ComposedChart + Bar for wicks
- Show real volume bars below the price chart

**Why #3:** The $MROCKS token is the flagship asset of the Moonsters 404 ecosystem. It is on the hero card on every Overview page load. Fabricated charts destroy trust the moment a user cross-references with DexScreener. This is a credibility risk that costs us users every day it stays.

---

### 4. Token Detail Page — Fill Missing Sections

**Current state:** The Token Detail page (`/dashboard/token/[id]`) exists as a route and `TokenDetailClient.tsx` component. We read `lib/api.ts` for `getDAOTokenDetail` which pulls CoinGecko community data, developer stats, and description. But the Settings page confirms that `developerMetrics: true` is configured only for tier3 with no enforcement in the UI. The current token detail page likely renders but is incomplete.

**What to build:**
- Developer Metrics panel (tier3 gate): GitHub commits (30d), contributors, PR merge rate, stars — pulled from CoinGecko's `developer_data` field already in `getDAOTokenDetail`
- Community panel: Twitter followers, Reddit subscribers, sentiment vote percentage — all already available from CoinGecko
- Fully working 30d/90d/1y price history chart using `getPriceHistory()` which is already implemented
- Related news feed for the token using `getTokenNews()` which is also already implemented
- Add a "Trade" button in the token detail header that opens SwapPanel (only Solana tokens have a mint mapped in `SwapPanel.tsx` — be accurate about which tokens are on Solana vs Ethereum)

**Why #4:** Users who discover an interesting token in Markets will click through to get deeper data. If the detail page is empty or incomplete, they leave to Birdeye and don't come back. The data is already being fetched — we just need to display it properly.

---

### 5. Price Alerts / Watchlist Notifications (Tier2+ Gate)

**Current state:** Zero alerting exists. There is no `/api/cron/alerts` route, no email service, no push mechanism.

**What to build:**
- Add alert configuration UI to the Watchlist page: user sets a price threshold (above/below) for any watched token
- Store alert configs in Postgres (new `PriceAlert` model: `userId`, `coinId`, `direction`, `targetPrice`, `triggered`, `createdAt`)
- Add a Vercel cron job at `/api/cron/price-alerts` (runs every 5 minutes) that checks current prices against configured alerts
- Deliver alerts via in-app notification center (bell icon in sidebar header with unread count) AND optional email via Resend
- Tier2: up to 5 alerts, no email. Tier3: unlimited alerts, email delivery

**Why #5:** This is the single feature that converts passive users into daily active users. Step Finance and Birdeye both have price alerts. Without it, our watchlist is a static list that users check manually and eventually forget about. Alerts drive retention.

---

### 6. Solana-Native DAO Token Expansion

**Current state:** `DAO_COINS` in `types/index.ts` lists 20 tokens — all are Ethereum or multi-chain governance tokens (UNI, AAVE, COMP, MKR, CRV, etc.). There is not a single Solana-native governance token in the list. No JTO (Jito), no MNDE (Marinade), no BONK DAO, no PYTH, no WEN, no DRIFT, no ORCA, no RAY (Raydium), no JUP (Jupiter DAO).

**What to build:**
- Replace at least 10 of the existing DAO_COINS with Solana-native governance tokens, prioritizing by TVL and community overlap with Moonsters holders
- Priority additions: JTO (Jito), MNDE (Marinade), JUP (Jupiter), PYTH (Pyth Network), ORCA (Orca), DRIFT, RAY (Raydium), BONK, WEN, HNT (Helium)
- For Solana tokens not listed on CoinGecko, add a parallel data source: Birdeye Token API or DexScreener token endpoint, with the same data shape normalized to `DAOToken`
- Add a "Solana DAOs" filter tab in the Markets page

**Why #6:** We are a Solana DAO dashboard and our token list is entirely Ethereum. This is the first thing any Solana power user notices and it immediately signals that MoonMap was not built by someone who lives on Solana. This fix repositions us from "generic DAO tracker with Moonsters branding" to "Solana DAO intelligence built by Moonsters."

---

### 7. Real Social Feed (Replace Nitter Placeholders)

**Current state:** `getMoonsterSocialPosts()` in `lib/api.ts` attempts to scrape Nitter (a public X mirror) via rss2json, falls back to a hardcoded placeholder post if all Nitter instances fail. Nitter instances are routinely blocked or rate-limited by X's infrastructure changes. The MOONSTER_ACCOUNTS list includes generic crypto KOLs (CryptoKaleo, solanalegend) who have no specific connection to Moonsters.

**What to build:**
- Replace Nitter with the X API v2 Basic tier (inexpensive) OR pivot to Discord/Telegram community feed if the project has an official channel
- Build a curated "Moonsters Community Alpha" feed — scrape the `@MoonstersX` official Twitter/X account posts via RSS (still possible with some RSS services), plus manual community-submitted alpha via a simple submission form (tier1+ only)
- Surface this feed prominently on the Overview dashboard under the MROCKS card as "Community Alpha"
- If X API cost is prohibitive short-term, replace the broken Nitter code with a curated embed of the official @MoonstersX timeline using Twitter's oEmbed endpoint

**Why #7:** Community social feed is a major differentiator for NFT-gated dashboards. It's the "show me what the Moonsters holders are talking about" feature that no general-purpose dashboard can replicate. Right now it's broken and shows nothing. That empty section actively hurts the product.

---

### 8. Mobile-Responsive Dashboard Overhaul

**Current state:** The sidebar layout (`flex h-screen overflow-hidden` with a fixed-width `w-56` sidebar) breaks on mobile. The dashboard is completely unusable on phones. The markets table with 9 columns (`#`, Token, Price, 24h, 7d, Mkt Cap, Volume, Trade, Watch) does not truncate or reflow on small screens. There are no media query breakpoints in the sidebar.

**What to build:**
- Convert sidebar to a slide-over drawer on mobile with a hamburger toggle
- Add a bottom navigation bar for mobile (Overview, Markets, $MROCKS, Portfolio, Watchlist — the 5 most-used sections)
- Make the markets table responsive: collapse Volume and 7d columns below tablet width, use card layout below 480px
- Test and fix the Jupiter SwapPanel at mobile widths (the `max-w-sm` panel should be full-width on mobile)
- Ensure token detail, portfolio, and gallery pages all work at 375px viewport width

**Why #8:** A significant fraction of crypto users check dashboards on their phones. Especially quick price checks. If MoonMap is desktop-only, we cede mobile check-in to Birdeye. Mobile is the retention channel for casual users.

---

### 9. Governance Proposal Voting History — Per DAO Token

**Current state:** Token Detail pages exist but no governance history is surfaced per token. The DAO_COINS list is governance tokens, yet we show zero governance data for any of them.

**What to build:**
- For each DAO token, show its last 5 governance proposals (title, date, outcome, vote count) on the Token Detail page
- Source: Snapshot API for most tokens. Tally API for on-chain tokens.
- Add a "Participation Score" metric: what % of total votes were cast vs quorum, used as a health signal
- Tier gating: proposal list visible to all tier1+ users; full vote breakdown, quorum %, and participation metrics gated to tier2+

**Why #9:** This makes MoonMap the only place where a user can check a token's price AND its governance health in the same view. This is the defining "DAO intelligence" feature that justifies the product name. Step Finance, AssetDash, and Birdeye do not have this.

---

### 10. Leaderboard Gamification — Points System

**Current state:** The leaderboard (`/dashboard/leaderboard`) shows all users ranked by tier with a watchlist count. It is purely cosmetic — ranking by tier is not a meritocratic ranking, it is just rarity sorting. There is no incentive to interact with the platform more because there is no score that increases.

**What to build:**
- Add a `points` field to the User model in Prisma
- Award points for: adding tokens to watchlist (+2/token), visiting the dashboard daily (+5/day streak), clicking through to governance proposals (+3), submitting community alpha (+10), holding for 30/60/90 days (+50/100/200)
- Show points total and a "rank by points" sort option on the leaderboard
- Add a mini-points display in the sidebar tier badge ("1,240 pts")
- Weekly point reset to prevent stagnation — rolling 30-day window

**Why #10:** Points systems drive daily active usage. The existing leaderboard has no reason for a user to come back tomorrow. A points system tied to genuine product behaviors (reading proposals, watching tokens, daily streaks) creates compounding engagement. This is the mechanic that turns weekly users into daily users.

---

## Feature Priorities Ranked by User Value

The following is the full feature backlog ranked by a composite score of:
- User value (how often users will use it, how much it improves their decisions)
- Differentiation (does any competitor have this?)
- Implementation complexity (days to ship)

| Priority | Feature | Tier Gate | Value | Differentiation |
|---|---|---|---|---|
| 1 | Real governance proposals feed | T2/T3 | Critical | Unique on Solana |
| 2 | Treasury analytics per DAO | T3 | Critical | Partial on DeFiLlama only |
| 3 | Real $MROCKS candlestick chart | All | High | N/A (credibility) |
| 4 | Token detail page completion | T2/T3 | High | Partial on Birdeye |
| 5 | Price alerts with email | T2/T3 | High | Available on Birdeye/Step |
| 6 | Solana DAO token expansion | All | High | Solana-native gap |
| 7 | Mobile responsive layout | All | High | N/A (table stakes) |
| 8 | Community social feed | T1+ | Medium | Unique (NFT community angle) |
| 9 | Per-token governance history | T1+ | Medium | Unique on Solana |
| 10 | Leaderboard points system | All | Medium | Unique in Solana dashboards |
| 11 | Email alerts onboarding flow | T2/T3 | Medium | Available elsewhere |
| 12 | Portfolio P&L history (30d chart) | T1+ | Medium | Available on AssetDash |
| 13 | $MROCKS staking tracker (Meteora) | T1+ | Medium | Moonsters-specific |
| 14 | CSV export of watchlist/portfolio | T3 | Low-Medium | Available on DeFiLlama |
| 15 | Developer metrics (GitHub) | T3 | Low-Medium | Available on CoinGecko |
| 16 | Multi-wallet portfolio aggregation | T2/T3 | Low-Medium | Available on AssetDash |
| 17 | NFT rarity score display in Gallery | All | Low | Available on Tensor |
| 18 | Dark/light theme toggle | All | Low | Table stakes |
| 19 | Push notifications (browser) | T3 | Low | Available elsewhere |
| 20 | API access for programmatic queries | T3 | Low | Premium feature |

---

## Competitive Positioning

### Step Finance
**What they do:** Portfolio tracker + DeFi position aggregator for Solana. Shows LP positions, farming rewards, staking yield. Strong wallet aggregation across Orca, Raydium, Kamino, etc.

**What they don't do:** No NFT gating. No DAO governance data. No sentiment analysis. No community-specific features. Purely financial portfolio view.

**Our position vs Step:** We are not competing on LP position tracking — that is Step's core and we should not try to replicate it. We compete by offering the governance and community layer that Step explicitly ignores. A power Solana DeFi user uses Step for their positions and MoonMap for their DAO intelligence.

**Key wedge against Step:** NFT-gated tiers that unlock increasing information quality. Step is free for everyone. MoonMap's tier gating creates information asymmetry — MOONSTER holders know things Astronaut holders don't, and non-holders know nothing. This rarity dynamic maps perfectly to the NFT collector mindset.

---

### AssetDash
**What they do:** Cross-chain portfolio tracker with NFT portfolio valuation, DeFi position tracking, and a basic news feed. Available on Solana and Ethereum. Has a mobile app.

**What they don't do:** No governance data. No DAO-specific analysis. No community layer. Generic news not curated for any specific community. No NFT-based access gating.

**Our position vs AssetDash:** AssetDash is a broad utility tool for the general crypto user. MoonMap is a focused intelligence tool for Moonsters holders. We win by depth and community specificity, not breadth. AssetDash tracking 200 protocols shallowly loses to us tracking 20 Solana DAOs deeply.

**Key wedge against AssetDash:** Our $MROCKS integration is unique — no portfolio tracker covers a specific community's native 404 token with this level of ecosystem context. The NFT ↔ token mechanics, staking on Meteora, and the community governance angle are entirely MoonMap-native features.

---

### Birdeye
**What they do:** The dominant Solana token analytics platform. Real-time prices, volume, liquidity, transaction history, holder counts, multi-DEX routing. Extremely fast. Used by traders and analysts.

**What they don't do:** No governance data. No portfolio tracking. No community features. No NFT access gating. Very technical/data-dense interface optimized for traders not community members.

**Our position vs Birdeye:** We cannot and should not compete on raw market data depth — Birdeye's data infrastructure is significantly more mature. Instead, we should use Birdeye as a data source for us (their public API is available) and compete on the layer above raw data: interpretation, context, and community.

**Key wedge against Birdeye:** The NFT community angle. A Moonsters holder visiting Birdeye sees token tickers on a dark screen. A Moonsters holder visiting MoonMap sees their NFT tier badge, their community rank on the leaderboard, the $MROCKS price their ecosystem depends on, and governance proposals they should vote on. It feels like home. Birdeye feels like Bloomberg.

**Tactical recommendation:** Display a prominent "Open in Birdeye" external link for tokens where users want deeper technical charts. Do not fight Birdeye on raw data. Win on context.

---

### DeFiLlama
**What they do:** DeFi protocol analytics: TVL tracking, chain comparisons, yield farming aggregation, treasury data for protocols, stablecoin analytics. Free, open-source, deeply trusted.

**What they don't do:** No wallet-specific portfolio tracking. No NFT integration. No governance. No community features. No Solana-specific curation.

**Our position vs DeFiLlama:** DeFiLlama is a reference tool used to answer macro questions ("what is Aave's TVL?"). MoonMap is a dashboard used to make decisions ("should I vote yes on this proposal and does it affect my position?"). We are not in competition — we should link to DeFiLlama's treasury data as a source and present it with community context.

**Key wedge against DeFiLlama:** DeFiLlama has no user identity layer. They cannot tell who you are. We know exactly who you are, what NFTs you hold, and what your tier is. This personalization gap is where we win.

---

### Summary Positioning Statement

> MoonMap is the DAO intelligence layer for Moonsters holders. Where other dashboards show you data, MoonMap shows you what that data means for your community. Your NFT is your access pass, your governance tool, your community rank, and your edge.

---

## Target KPIs

### User Acquisition
| Metric | Current (Est.) | 90-day Target | 12-month Target |
|---|---|---|---|
| Total registered wallet addresses | ~1,200 (landing page stat) | 2,500 | 10,000 |
| Daily Active Users (DAU) | Unknown | 150 | 800 |
| DAU / MAU ratio | Unknown | 15% | 25% |
| 10-min trial → NFT purchase conversion | Unknown | 3% | 8% |
| New wallet signups / week | Unknown | 50 | 250 |

### Engagement (Dashboard)
| Metric | Current | 90-day Target | 12-month Target |
|---|---|---|---|
| Avg session duration | Unknown | 4 min | 8 min |
| Watchlist items per active user | Unknown | 5 | 12 |
| Governance proposals viewed / week | N/A (feature not built) | 200 | 2,000 |
| Price alerts set per active user | N/A (feature not built) | 3 | 8 |
| Leaderboard DAU (% of total DAU) | Unknown | 20% | 35% |

### Token / NFT Health
| Metric | Current | 90-day Target | 12-month Target |
|---|---|---|---|
| $MROCKS swap volume attributed to MoonMap | Unknown | $5,000/week | $50,000/week |
| Moonsters NFT floor price (SOL) | Market-dependent | Floor ≥ launch price | Floor 2x launch |
| Tier3 (Blue Chain) holders on platform | Unknown | 50 | 200 |
| MoonMap → Tensor referral clicks / week | Unknown | 100 | 500 |

### Retention
| Metric | Current | 90-day Target | 12-month Target |
|---|---|---|---|
| 7-day retention (users who return within 7 days) | Unknown | 30% | 50% |
| 30-day retention | Unknown | 15% | 35% |
| Churn (users who connect and never return) | Unknown | <70% | <40% |

### Technical Health
| Metric | Current | 90-day Target |
|---|---|---|
| Dashboard page load time (P95) | Unknown | <1.5s |
| API error rate (5xx) | Unknown | <0.5% |
| NFT tier detection accuracy | ~99% (Helius DAS) | 99.9% |
| Uptime | Unknown | 99.5% |

---

*MoonMap is built by the community, for the community. The rarer your Moonster, the sharper your intelligence edge. This is not financial advice.*
