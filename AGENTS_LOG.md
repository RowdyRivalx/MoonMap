# MoonMap Agents Log

## Backend Dev

Expanded data coverage and hardened backend reliability across four files and one new route.

### types/index.ts
- Extended `DAO_COINS` from 20 to 46 tokens by adding Solana-native and ecosystem tokens: `jupiter`, `bonk`, `dogwifcoin`, `jito-governance`, `pyth-network`, `orca`, `raydium`, `marinade`, `drift-protocol`, `tensor`, `kamino`, `helium`, `render-token`, `wormhole`, `stepn`, `star-atlas`, `aurory`, `gmt`, `atlas`, `polis`, `samo`, `cope`, `media-network`, `oxygen`, `portals`, `metaplex`.

### lib/tokens.ts
- Added Solana mint address mappings for all new tokens with verified on-chain mint addresses: Jupiter (JUP), BONK, WIF (dogwifcoin), Jito, Pyth, Orca, Raydium, Marinade, Drift, Render, Helium, STEPN (GMT), Star Atlas (ATLAS/POLIS), and SAMO.

### lib/api.ts
- Added `getTopMovers(tokenList?, limit?)` — fetches all DAO tokens, filters to those with valid 24h price change data, and returns the top N gainers and top N losers sorted by `price_change_percentage_24h`.
- Wrapped `getDAOTokens`, `getPriceHistory` in try/catch blocks that log errors and return empty arrays instead of throwing, preventing page crashes on CoinGecko failures.
- Wrapped `getDAOTokenDetail` in try/catch that re-throws (preserving existing detail-page error boundary behavior) while logging the error.

### app/api/data/trending/route.ts (new)
- New GET endpoint at `/api/data/trending` protected by `getServerSession`.
- Fetches all `DAO_COINS` via CoinGecko markets, then derives:
  - `gainers` — top 5 by 24h price change
  - `losers` — bottom 5 by 24h price change
  - `trending` — top 10 by volume/market-cap ratio (activity signal)
- Returns `{ gainers, losers, trending }` with a 60-second `Cache-Control` header.

---

## Frontend Dev

**Completed — 2026-03-17**

Implemented a comprehensive set of UX/feature improvements across all dashboard client components.

### DashboardClient.tsx
- Added a **live scrolling market ticker** at the top of the page: shows top 8 tokens by market cap with symbol, live price, and 24h % change. Uses `requestAnimationFrame` for a smooth infinite-loop scroll (element duplicated for seamlessness), with fade-edge masks on both sides.
- Added a **Market Overview stat bar** (4 stat cards): total tokens tracked, avg 24h change, bullish count, bearish count — all computed from the `tokens` prop.
- Added a **Top Movers section** placed above the MROCKS hero card: two side-by-side panels showing top 3 gainers and top 3 losers sorted by `price_change_percentage_24h`. Each row shows token icon, name/symbol, an inline SVG sparkline (last 24 points from `sparkline_in_7d.price`), current price, and 24h %.
- Added optional `tokens?: DAOToken[]` prop to `Props` (backward-compatible, defaults to `[]`).

### MarketsClient.tsx
- Added a **category filter bar** (`All | DeFi | Gaming | NFT | Infra`) with a `CATEGORY_MAP` lookup by coin id. Active state uses violet highlight; live token count shown on the right.
- Added a **Sparkline column** (7-day inline SVG polyline): downsampled to ~28 points from `sparkline_in_7d.price`; green if 7d change ≥ 0, red otherwise. Falls back to a `—` placeholder.
- Added a **% from ATH column**: uses `ath_change_percentage` if available, otherwise calculates from `ath` / `current_price`. Shown in emerald if at/above ATH, muted zinc otherwise.
- Added **alternating row backgrounds** (subtle `rgba(255,255,255,0.012)` on odd rows) for improved scannability.

### WatchlistClient.tsx
- Added a **portfolio summary banner** (4-card grid, shown when watchlist is non-empty):
  - "Watchlist Performance" card: avg 24h and avg 7d change, plus a `PerformanceBar` component — a colored horizontal distribution bar showing gainers/neutral/losers with percentages.
  - "Combined Mkt Cap" card: sum of all watched tokens' market caps.
  - "Best 24h" card: token icon, symbol, and top 24h performer's percentage.
- Added **alternating row backgrounds** in the watchlist table (consistent with MarketsClient).

### NewsClient.tsx
- Redesigned **sentiment summary cards**: main mood card uses dynamic background/border/text color (green/amber/red). Bullish/Bearish cards have matching tinted backgrounds and show percentage of total signals.
- Added **"BREAKING" / "LIVE" badge** on articles published within the last hour: red pulsing pill badge (`animate-pulse`) in the tags row plus a `Zap` icon overlay on the thumbnail corner.
- Added **per-article sentiment tags** (🐂 BULLISH / 🐻 BEARISH / ⚖️ NEUTRAL) derived from vote ratios, displayed as colored rounded pills above each headline.
- Improved **vote sentiment bar**: dynamic color (green/amber/red) based on bullish percentage, with a `% bull` label below.
- Enlarged thumbnail to `w-20 h-16` with `rounded-xl`. Source name now shown in violet tint.
- Active tab has a glow box-shadow (`0 0 12px rgba(124,58,237,0.35)`).

### Sidebar.tsx
- Added **keyboard shortcut hints** per nav item (`G O`, `G M`, `G W`, `G N`, etc.) as small monospace pill badges — visible at 30% opacity on hover and 40% opacity when active.
- Made the **active page indicator more prominent**: vertical left-edge accent bar (gradient violet with glow shadow) and enlarged/glowing active dot.
- Added optional `portfolioValue?: number | null` prop: when provided and > 0, renders a **"PORTFOLIO VALUE"** display card just above the tier badge.

---

## Visual Design

**Completed — 2026-03-17**

Full premium visual overhaul across 7 files. Goal: make MoonMap feel like a high-end crypto product that Moonsters NFT holders are proud to use.

### tailwind.config.ts
- Added full `moonPurple`, `moonLime`, `moonGold`, `moonCyan` color scales (50–950 shades each).
- Added custom font families: `display` (Syne), `mono` (Space Mono), `monster` (Bungee).
- Added custom animations: `shimmer`, `float-gentle`, `pulse-glow`, `slide-up`, `spin-slow`.
- Added custom box shadows: `glow-purple`, `glow-purple-sm`, `glow-lime`, `glow-lime-sm`, `glow-gold`, `glow-gold-sm`, `glow-cyan`, `card`, `card-hover`.
- Added `backgroundImage` helpers: `gradient-radial`, `gradient-conic`, `hero-glow`.

### app/globals.css
- Smooth scroll + `scroll-padding-top: 80px` for sticky nav clearance; `-moz-osx-font-smoothing` added.
- **`.card`** — upgraded glass morphism: stronger `backdrop-filter: blur(20px) saturate(1.2)`, `box-shadow`, gradient top-edge highlight via `::after`, hover lifts with purple glow and border brighten.
- **`.stat-card`** — new purpose-built metric display card: tighter radius, 2px top accent bar, distinct hover state.
- **`.gradient-text`** (purple→cyan), **`.gradient-text-lime`** (lime→cyan), **`.gradient-text-gold`** (gold→orange) — gradient clipped text utilities.
- **`.badge-tier1/2/3`** — colored tier badges with matching glow box-shadows.
- **`.price-up` / `.price-down`** — green/red with subtle background pill.
- **`@keyframes pulse-glow`** — pulsing box-shadow for CTAs; `.pulse-glow` class.
- **`@keyframes slide-up`** — smooth card entrance; `.slide-up`, `.slide-up-1..4` stagger classes.
- **Shimmer** — `@keyframes shimmer-anim` with `.shimmer` using it. Backward-compat `@keyframes shimmer` alias kept.
- **`@keyframes float-gentle`** — gentle bob; `.animate-float` class.
- **Scrollbar** — thinned to 4px, added track color, border on thumb, Firefox `scrollbar-width: thin` support.
- **`.btn-primary`** — deeper gradient `#7c3aed → #5b21b6`, spring cubic-bezier transform, `::before` shine overlay on hover, stronger glow + scale(1.02).
- **`.btn-secondary`** — hover color lightens to `#c4b5fd`, gains glow shadow + translate.
- **`.btn-neon`** — stronger glow, spring transform, brighter hover background.
- Added `.section-badge` (pill eyebrow labels), `.divider` (gradient horizontal rule), all neon glow/text-glow variants consolidated and added `text-glow-cyan`.

### app/page.tsx
- Completely redesigned landing page with 5 distinct sections: Nav, Hero, Stats Bar, Features, Tiers, CTA Strip, Footer.
- **Nav** — inline anchor links (Features, Access, Pricing); refined logo glow; separated into nav + links groups.
- **Hero** — live pulse dot in wordmark eyebrow; headline up to `7xl`; floating data chips ("Portfolio +18.4%", "3 Active Votes") using `animate-float`; trust micro-copy row with `CheckCircle2` icons; rotating dashed orbit ring behind characters; radial hero glow overlay.
- **Stats bar** — per-stat `textShadow` glow; shimmer strip at top via `.shimmer` class.
- **Features** — section badge eyebrow; accent color divider under icon per card; `slide-up` stagger animations; icons in dedicated glow-bordered icon boxes with matching color accent line.
- **Tiers** — redesigned as bordered rounded-2xl cards with top color bar, `CheckCircle2` checkmarks, "TOP TIER" badge on MOONSTER tier; background radial glow; `glow-tier3` on MOONSTER card.
- **CTA strip** — new "Ready to navigate the moon map?" section with dual CTA.
- All existing functionality (links, wallet connect, Tensor trade link) preserved.

### components/MoonsterBackground.tsx
- Added 12 lightweight CSS-only particle dots via `position: fixed` divs; reuse existing `float-around` keyframe with per-particle timing.
- Added `ScanLine` sub-component — a single `requestAnimationFrame`-driven 1px horizontal line traversing the viewport for a data-terminal aesthetic. Zero extra assets, ~20 lines JS. Cancels on unmount.
- Bumped floater opacity and drop-shadow values slightly for more atmospheric presence.
- Added `will-change: transform` on `.moonster-float` for GPU compositing hint.

### components/dashboard/TrialBanner.tsx
- Complete redesign with three urgency tiers: normal (purple), urgent <2 min (amber), critical <1 min (red).
- Countdown shown as large `2xl` Space Mono tabular numerals with matching color text glow.
- Progress bar along bottom of banner fills as trial time is consumed; color tracks urgency.
- Top gradient accent bar in urgency color.
- Urgency label shifts: "remaining" → "expiring soon" → "HURRY!".
- CTA button uses gradient background (purple/amber/red) with matching glow.
- `pulse-glow` animation applied to whole banner when critical.
- Expired state uses `AlertTriangle` icon and red gradient CTA.

### components/dashboard/PortfolioClient.tsx (styling only, no data logic changes)
- Summary stat cards use `.stat-card` instead of `.card`, with per-metric color border and icon badge.
- NFT grid cards gain `hover:-translate-y-1` and per-tier `boxShadow` glow.
- Wallet separator uses `&middot;` for typographic correctness.
- Refresh button gains `hover:-translate-y-0.5` transition.

### components/dashboard/GalleryClient.tsx (styling only)
- Tier legend cards use `.stat-card` with top accent bar and rounded-full trait pill badges.
- Loading skeletons use `.shimmer` class instead of `animate-pulse` divs for consistent look.
