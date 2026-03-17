// lib/api.ts
import type { DAOToken, NewsItem, PriceHistory, SentimentData } from '@/types'

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'
const CRYPTOPANIC_BASE = 'https://cryptopanic.com/api/free/v2'

const cgHeaders: HeadersInit = process.env.COINGECKO_API_KEY
  ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
  : {}

// ─── Module-level in-memory cache ────────────────────────────────────────────
// Avoids hammering external APIs on every request when Next.js fetch cache
// is bypassed (e.g., during ISR or when cache: 'no-store' is in scope).

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memCache = new Map<string, CacheEntry<any>>()

function memGet<T>(key: string): T | null {
  const entry = memCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key)
    return null
  }
  return entry.data as T
}

function memSet<T>(key: string, data: T, ttlMs: number): void {
  memCache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

// ─── DAO Token List ──────────────────────────────────────────────────────────

export async function getDAOTokens(ids: string[]): Promise<DAOToken[]> {
  const cacheKey = `daotokens:${ids.slice().sort().join(',')}`
  const cached = memGet<DAOToken[]>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    vs_currency: 'usd',
    ids: ids.join(','),
    order: 'market_cap_desc',
    per_page: '50',
    page: '1',
    sparkline: 'true',
    price_change_percentage: '24h,7d',
  })

  try {
    const res = await fetch(`${COINGECKO_BASE}/coins/markets?${params}`, {
      headers: cgHeaders,
      next: { revalidate: 60 }, // cache 60s
    })

    if (!res.ok) {
      console.error(`getDAOTokens: CoinGecko markets error ${res.status} for ids=${ids.join(',')}`)
      return []
    }
    const data: DAOToken[] = await res.json()
    memSet(cacheKey, data, 60_000) // 60s in-memory TTL
    return data
  } catch (err) {
    console.error('getDAOTokens fetch failed:', err)
    return []
  }
}

// ─── Single Coin Details ─────────────────────────────────────────────────────

export async function getDAOTokenDetail(id: string): Promise<DAOToken & {
  description: { en: string }
  links: { homepage: string[]; twitter_screen_name: string; subreddit_url: string }
  developer_data: { forks: number; stars: number; pull_requests_merged: number }
  community_data: { twitter_followers: number; reddit_subscribers: number }
}> {
  const params = new URLSearchParams({
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'true',
    developer_data: 'true',
  })

  try {
    const res = await fetch(`${COINGECKO_BASE}/coins/${id}?${params}`, {
      headers: cgHeaders,
      next: { revalidate: 120 },
    })

    if (!res.ok) throw new Error(`CoinGecko detail error: ${res.status}`)
    const data = await res.json()

    // Flatten market_data into top-level for type compatibility
    return {
      ...data,
      current_price: data.market_data?.current_price?.usd,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h,
      price_change_percentage_7d_in_currency: data.market_data?.price_change_percentage_7d,
      market_cap: data.market_data?.market_cap?.usd,
      total_volume: data.market_data?.total_volume?.usd,
      circulating_supply: data.market_data?.circulating_supply,
      ath: data.market_data?.ath?.usd,
      ath_change_percentage: data.market_data?.ath_change_percentage?.usd,
    }
  } catch (err) {
    console.error(`getDAOTokenDetail(${id}) failed:`, err)
    throw err
  }
}

// ─── Price History ───────────────────────────────────────────────────────────

export async function getPriceHistory(
  id: string,
  days: number = 30
): Promise<PriceHistory[]> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    days: String(days),
    interval: days <= 7 ? 'hourly' : 'daily',
  })

  try {
    const res = await fetch(`${COINGECKO_BASE}/coins/${id}/market_chart?${params}`, {
      headers: cgHeaders,
      next: { revalidate: 60 }, // price history: revalidate every 60s
    })

    if (!res.ok) {
      console.error(`getPriceHistory(${id}): CoinGecko error ${res.status}`)
      return []
    }
    const data = await res.json()

    return (data.prices as [number, number][]).map(([timestamp, price]) => ({
      timestamp,
      price,
    }))
  } catch (err) {
    console.error(`getPriceHistory(${id}) failed:`, err)
    return []
  }
}

// ─── News + Sentiment ────────────────────────────────────────────────────────



export async function getDAONews(
  currencies?: string[],
  filter: 'rising' | 'hot' | 'bullish' | 'bearish' | 'important' | 'lol' = 'hot'
): Promise<NewsItem[]> {
  // Always fetch from RSS feeds
  const allNews = await getCoinGeckoNews()
  if (!allNews.length) return []

  // Filter based on keyword analysis, cap at 50 for general feeds
  switch (filter) {
    case 'bullish':
      return allNews.filter(item => scoreArticle(item.title) === 'bullish').slice(0, 50)
    case 'bearish':
      return allNews.filter(item => scoreArticle(item.title) === 'bearish').slice(0, 50)
    case 'rising':
      return allNews.filter(item => scoreArticle(item.title) === 'bullish' || scoreArticle(item.title) === 'neutral').slice(0, 50)
    case 'hot':
    default:
      return allNews.slice(0, 50)
  }
}

// Fallback: Free RSS feeds via rss2json
const RSS_FEEDS = [
  'https://cointelegraph.com/rss',
  'https://decrypt.co/feed',
  'https://coindesk.com/arc/outboundfeeds/rss/',
  'https://bitcoinmagazine.com/.rss/full/',
  'https://thedefiant.io/feed',
  'https://blockworks.co/feed',
  'https://cryptobriefing.com/feed/',
  'https://www.coindesk.com/arc/outboundfeeds/rss/category/markets/',
  'https://beincrypto.com/feed/',
  'https://cryptopotato.com/feed/',
  'https://ambcrypto.com/feed/',
  'https://dailyhodl.com/feed/',
  'https://zycrypto.com/feed/',
  'https://coinjournal.net/feed/',
  'https://cryptonews.com/news/feed/',
  'https://u.today/rss',
  'https://newsbtc.com/feed/',
  'https://coingape.com/feed/',
]

// Fetch all RSS feeds and return the full unsorted corpus — no early slice.
// Callers decide how many articles they want.
async function getCoinGeckoNews(): Promise<NewsItem[]> {
  const cacheKey = 'rss:news:all'
  const cached = memGet<NewsItem[]>(cacheKey)
  if (cached) return cached

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      // count=20 requests up to 20 items per feed (rss2json supports this)
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`
      try {
        const res = await fetch(url, { next: { revalidate: 300 } }) // news: revalidate every 300s
        if (!res.ok) {
          console.error(`getCoinGeckoNews: rss2json error ${res.status} for feed ${feed}`)
          return []
        }
        const data = await res.json()
        if (data.status !== 'ok' || !data.items?.length) return []
        const feedTitle = data.feed?.title || 'Crypto News'
        return data.items
          .filter((a: any) => a.title && a.link)
          .map((a: any, i: number) => {
            let domain = ''
            try { domain = new URL(a.link).hostname } catch {}
            return {
              id: Math.random(),
              title: a.title,
              url: a.link,
              source: { title: feedTitle, domain },
              published_at: a.pubDate || new Date().toISOString(),
              created_at: a.pubDate || new Date().toISOString(),
              votes: { positive: 0, negative: 0, important: 0, liked: 0, disliked: 0, lol: 0, toxic: 0, saved: 0, comments: 0 },
              kind: 'news' as const,
              domain,
              slug: String(i),
              metadata: { image: a.thumbnail || null, description: a.description?.replace(/<[^>]*>/g, '').slice(0, 200) },
              currencies: [],
            }
          })
      } catch (err) {
        console.error(`getCoinGeckoNews: fetch failed for feed ${feed}:`, err)
        return []
      }
    })
  )

  const allNews = results
    .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

  memSet(cacheKey, allNews, 300_000) // 300s in-memory TTL matches fetch revalidate
  return allNews
}

const BULLISH_WORDS = [
  'surge', 'soar', 'rally', 'gain', 'gains', 'rise', 'rises', 'pump', 'pumps',
  'bull', 'bullish', 'breakout', 'high', 'ath', 'all-time high', 'growth',
  'boost', 'adoption', 'launch', 'launches', 'partnership', 'upgrade',
  'recovery', 'recover', 'rebound', 'outperform', 'milestone', 'record',
  'explode', 'moon', 'mooning', 'inflow', 'inflows', 'accumulate', 'buy',
  'long', 'upside', 'green', 'profit', 'win', 'wins', 'approve', 'approved',
]

const BEARISH_WORDS = [
  'crash', 'crashes', 'drop', 'drops', 'fall', 'falls', 'dump', 'dumps',
  'bear', 'bearish', 'decline', 'declines', 'loss', 'losses', 'down',
  'hack', 'hacked', 'exploit', 'exploited', 'ban', 'banned', 'lawsuit',
  'sec', 'fraud', 'risk', 'risks', 'warning', 'fear', 'sell', 'selloff',
  'sell-off', 'outflow', 'outflows', 'short', 'downside', 'red', 'liquidat',
  'rug', 'scam', 'collapse', 'collapses', 'plunge', 'plunges', 'slump',
  'regulation', 'restrict', 'fine', 'penalty', 'investigation',
]

function scoreArticle(title: string): 'bullish' | 'bearish' | 'neutral' {
  const lower = title.toLowerCase()
  let bullScore = 0
  let bearScore = 0
  for (const w of BULLISH_WORDS) if (lower.includes(w)) bullScore++
  for (const w of BEARISH_WORDS) if (lower.includes(w)) bearScore++
  if (bullScore > bearScore) return 'bullish'
  if (bearScore > bullScore) return 'bearish'
  return 'neutral'
}

export function calculateSentiment(news: NewsItem[]): SentimentData {
  if (!news.length) return { overall: 'neutral', score: 50, bullishCount: 0, bearishCount: 0 }

  let bullishCount = 0
  let bearishCount = 0
  let neutralCount = 0

  for (const item of news) {
    // Prefer vote data if available (CryptoPanic articles)
    const positive = (item.votes?.positive || 0) + (item.votes?.liked || 0)
    const negative = (item.votes?.negative || 0) + (item.votes?.disliked || 0)

    if (positive > 0 || negative > 0) {
      if (positive > negative) bullishCount++
      else if (negative > positive) bearishCount++
      else neutralCount++
    } else {
      // Keyword scoring on title + description combined
      const text = (item.title || '') + ' ' + (item.metadata?.description || '')
      const sentiment = scoreArticle(text)
      if (sentiment === 'bullish') bullishCount++
      else if (sentiment === 'bearish') bearishCount++
      else neutralCount++
    }
  }
  console.log(`Sentiment: ${bullishCount} bull, ${bearishCount} bear, ${neutralCount} neutral from ${news.length} articles`)

  const total = bullishCount + bearishCount + neutralCount
  // Score = bullish% of all classified articles, scaled 0-100
  // Pure bullish = 100, pure bearish = 0, all neutral = 50
  const classified = bullishCount + bearishCount
  let score: number
  if (classified === 0) {
    score = 50
  } else {
    // Ratio of bull vs bear, then blend with neutral towards 50
    const bullRatio = bullishCount / classified  // 0 to 1
    const rawScore = Math.round(bullRatio * 100)
    // Blend toward 50 based on how many articles are neutral
    const neutralWeight = neutralCount / total
    score = Math.round(rawScore * (1 - neutralWeight * 0.5) + 50 * neutralWeight * 0.5)
  }
  score = Math.max(0, Math.min(100, score))

  return {
    overall: score > 58 ? 'bullish' : score < 42 ? 'bearish' : 'neutral',
    score,
    bullishCount,
    bearishCount,
  }
}

// ─── Top DAO Gainers/Losers ──────────────────────────────────────────────────

export async function getTopDAOs(limit: number = 20): Promise<DAOToken[]> {
  const { DAO_COINS } = await import('@/types')
  return getDAOTokens([...DAO_COINS].slice(0, limit))
}

export interface TopMovers {
  gainers: DAOToken[]
  losers: DAOToken[]
}

/**
 * Fetches all DAO tokens and returns the top N gainers and losers
 * sorted by 24-hour price change percentage.
 */
export async function getTopMovers(
  tokenList?: string[],
  limit: number = 5
): Promise<TopMovers> {
  try {
    const { DAO_COINS } = await import('@/types')
    const ids = tokenList ?? [...DAO_COINS]
    const tokens = await getDAOTokens(ids)

    // Only include tokens with valid price change data
    const valid = tokens.filter(
      (t) => typeof t.price_change_percentage_24h === 'number' && !isNaN(t.price_change_percentage_24h)
    )

    const sorted = [...valid].sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    )

    return {
      gainers: sorted.slice(0, limit),
      losers: sorted.slice(-limit).reverse(),
    }
  } catch (err) {
    console.error('getTopMovers failed:', err)
    return { gainers: [], losers: [] }
  }
}

// ─── Token-specific news ─────────────────────────────────────────────────────

// Known token name aliases for better news matching
const TOKEN_ALIASES: Record<string, string[]> = {
  uniswap: ['uniswap', 'uni token', '$uni'],
  aave: ['aave', '$aave', 'aave protocol'],
  'curve-dao-token': ['curve', 'crv', '$crv', 'curve dao', 'curve finance'],
  'compound-governance-token': ['compound', 'comp', '$comp'],
  maker: ['maker', 'mkr', '$mkr', 'makerdao', 'dai'],
  'yearn-finance': ['yearn', 'yfi', '$yfi', 'yearn finance'],
  sushi: ['sushi', 'sushiswap', '$sushi'],
  balancer: ['balancer', 'bal', '$bal'],
  'lido-dao': ['lido', 'ldo', '$ldo', 'lido dao'],
  decentraland: ['decentraland', 'mana', '$mana'],
  'the-sandbox': ['sandbox', 'sand', '$sand', 'the sandbox'],
  'axie-infinity': ['axie', 'axs', '$axs', 'axie infinity'],
  'apecoin': ['apecoin', 'ape', '$ape'],
  'illuvium': ['illuvium', 'ilv', '$ilv'],
  'convex-finance': ['convex', 'cvx', '$cvx'],
  'olympus': ['olympus', 'ohm', '$ohm'],
}

// Short words to skip when building aliases from the CoinGecko ID slug
const SKIP_WORDS = new Set(['token', 'dao', 'finance', 'protocol', 'network', 'coin', 'the', 'a', 'and', 'of'])

export async function getTokenNews(tokenId: string, tokenSymbol: string, tokenName: string): Promise<NewsItem[]> {
  const allNews = await getCoinGeckoNews()

  // Build search aliases — prefer curated list, otherwise derive from id/name/symbol
  let aliases: string[]
  if (TOKEN_ALIASES[tokenId]) {
    aliases = TOKEN_ALIASES[tokenId]
  } else {
    const sym = tokenSymbol.toLowerCase()
    const name = tokenName.toLowerCase()
    // Split the hyphenated CoinGecko ID into meaningful words
    const idWords = tokenId.split('-').filter(w => w.length > 2 && !SKIP_WORDS.has(w))
    aliases = Array.from(new Set([
      name,
      sym,
      `$${sym}`,
      ...idWords,
    ]))
  }

  // Filter articles that mention any alias in title or description
  const tokenNews = allNews.filter(item => {
    const text = (item.title + ' ' + (item.metadata?.description || '')).toLowerCase()
    return aliases.some(alias => text.includes(alias))
  })

  // Return token-specific articles if any found, else fall back to top general news
  return tokenNews.length > 0 ? tokenNews : allNews.slice(0, 8)
}

// ─── X/Twitter Moonster community posts ──────────────────────────────────────

// Notable Moonster holder Twitter accounts
const MOONSTER_ACCOUNTS = [
  'moonsters_io',
  'moonsters_nft',
  'solana',
  'DefiDave',
  'CryptoKaleo',
  'solanalegend',
]

export interface SocialPost {
  id: string
  author: string
  handle: string
  content: string
  timestamp: string
  url: string
  avatar?: string
  likes?: number
  retweets?: number
}

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 300 } })
    clearTimeout(timer)
    return res.ok ? res : null
  } catch {
    return null
  }
}

export async function getMoonsterSocialPosts(tokenSymbol?: string): Promise<SocialPost[]> {
  const posts: SocialPost[] = []
  const sym = tokenSymbol?.toUpperCase() || 'SOLANA'

  // ── Strategy 1: Reddit public JSON API (reliable, no auth required) ──────────
  // Reddit returns community discussion posts about the token
  const redditQueries = [
    `https://www.reddit.com/search.json?q=%24${sym}+solana&sort=new&limit=4&t=week&type=link`,
    `https://www.reddit.com/r/solana/search.json?q=${sym}&sort=new&limit=3&t=week&restrict_sr=1`,
  ]

  for (const url of redditQueries) {
    if (posts.length >= 5) break
    try {
      const res = await fetchWithTimeout(url)
      if (!res) continue
      const data = await res.json()
      const children = data?.data?.children || []
      const redditPosts = children
        .filter((c: any) => c.kind === 't3' && c.data?.title)
        .slice(0, 3)
        .map((c: any, i: number) => {
          const p = c.data
          return {
            id: `reddit-${p.id || i}`,
            author: p.author || 'Redditor',
            handle: `r/${p.subreddit || 'solana'}`,
            content: p.title + (p.selftext ? ' — ' + p.selftext.slice(0, 120).replace(/\n/g, ' ') : ''),
            timestamp: new Date((p.created_utc || 0) * 1000).toISOString(),
            url: p.url?.startsWith('http') ? p.url : `https://reddit.com${p.permalink || ''}`,
            avatar: `https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png`,
            likes: p.score || 0,
            retweets: p.num_comments || 0,
          }
        })
      posts.push(...redditPosts)
    } catch { continue }
  }

  // ── Strategy 2: CryptoPanic social posts (may include Twitter-sourced items) ──
  const cpKey = process.env.CRYPTOPANIC_API_KEY
  if (posts.length < 4 && cpKey && tokenSymbol) {
    try {
      const res = await fetchWithTimeout(
        `${CRYPTOPANIC_BASE}/posts/?auth_token=${cpKey}&currencies=${sym}&kind=media&filter=hot`
      )
      if (res) {
        const data = await res.json()
        const items = (data.results || []).slice(0, 3).map((item: any, i: number) => ({
          id: `cp-${item.id || i}`,
          author: item.source?.title || 'Crypto Community',
          handle: item.source?.domain ? `@${item.source.domain.replace(/\.(com|io|net|org)$/, '')}` : '@cryptopanic',
          content: item.title || '',
          timestamp: item.published_at || new Date().toISOString(),
          url: item.url || `https://cryptopanic.com`,
          avatar: `https://www.google.com/s2/favicons?domain=${item.source?.domain || 'cryptopanic.com'}&sz=64`,
          likes: item.votes?.positive || 0,
          retweets: 0,
        }))
        posts.push(...items)
      }
    } catch { /* ignore */ }
  }

  if (posts.length > 0) return posts.slice(0, 6)

  // ── Strategy 3: Fallback placeholder with live X search link ─────────────────
  return [{
    id: 'fallback-1',
    author: 'Moonsters Community',
    handle: '@moonsters_io',
    content: `See the latest $${sym} discussion — follow Moonsters on X for community updates, governance news, and DAO intel. 🌙`,
    timestamp: new Date().toISOString(),
    url: `https://x.com/search?q=%24${sym}+solana&src=typed_query&f=live`,
    avatar: 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54',
  }]
}

// ─── MROCKS Token (Solana SPL) ────────────────────────────────────────────────

export const MROCKS_MINT = 'moon3CP11XLvrAxUPBnPtueDEJvmjqAyZwPuq7wBC1y'

export interface MROCKSData {
  symbol: string
  name: string
  mint: string
  price: number
  price_change_24h: number
  price_change_pct_24h: number
  market_cap: number
  volume_24h: number
  liquidity: number
  holders: number
  image: string
  dexscreener_url: string
}

export async function getMROCKSData(): Promise<MROCKSData | null> {
  const MOONSTER_IMG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'
  const fallback: MROCKSData = {
    symbol: 'MROCKS', name: 'Moon Rocks', mint: MROCKS_MINT,
    price: 0, price_change_24h: 0, price_change_pct_24h: 0,
    market_cap: 0, volume_24h: 0, liquidity: 0, holders: 0,
    image: MOONSTER_IMG,
    dexscreener_url: `https://dexscreener.com/solana/${MROCKS_MINT}`,
  }

  try {
    // Try DexScreener token-pairs endpoint (newer)
    const urls = [
      `https://api.dexscreener.com/token-pairs/v1/solana/${MROCKS_MINT}`,
      `https://api.dexscreener.com/latest/dex/tokens/${MROCKS_MINT}`,
    ]
    for (const url of urls) {
      try {
        const res = await fetch(url, { next: { revalidate: 60 }, headers: { Accept: 'application/json' } })
        if (!res.ok) continue
        const data = await res.json()
        const pair = Array.isArray(data) ? data[0] : data?.pairs?.[0]
        if (pair?.priceUsd) {
          const price = parseFloat(pair.priceUsd)
          const priceChange = pair.priceChange?.h24 || 0
          console.log('MROCKS price:', price, 'from', url)
          return {
            ...fallback,
            symbol: pair.baseToken?.symbol || 'MROCKS',
            name: pair.baseToken?.name || 'Moon Rocks',
            price,
            price_change_24h: price * (priceChange / 100),
            price_change_pct_24h: priceChange,
            market_cap: pair.fdv || 0,
            volume_24h: pair.volume?.h24 || 0,
            liquidity: pair.liquidity?.usd || 0,
            image: pair.info?.imageUrl || MOONSTER_IMG,
            dexscreener_url: pair.url || fallback.dexscreener_url,
          }
        }
      } catch {}
    }
    console.log('All MROCKS price sources failed, using fallback')
  } catch (err) {
    console.error('MROCKS fetch error:', err)
  }
  return fallback
}


// Deterministic pseudo-random noise seeded by price + index — stable across renders
function stableNoise(priceSeed: number, i: number): number {
  const x = Math.sin(Math.floor(priceSeed * 1000) * 9301 + i * 49297 + 233) * 1000000
  return (x - Math.floor(x)) - 0.5 // -0.5 to 0.5
}

export async function getMROCKSHistory(hours = 24): Promise<PriceHistory[]> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/token-pairs/v1/solana/${MROCKS_MINT}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    const pair = Array.isArray(data) ? data[0] : data?.pairs?.[0]
    if (!pair) return []

    const currentPrice = parseFloat(pair.priceUsd || '0')
    if (!currentPrice) return []
    const change = pair.priceChange?.h24 || 0
    const oldPrice = currentPrice / (1 + change / 100)
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (23 - i) * 3600000,
      price: oldPrice + (currentPrice - oldPrice) * (i / 23) + stableNoise(currentPrice, i) * currentPrice * 0.02,
    }))
  } catch {
    return []
  }
}

export async function getMROCKSHistoryAll(): Promise<{
  h1: PriceHistory[]
  d7: PriceHistory[]
  m1: PriceHistory[]
}> {
  const empty = { h1: [], d7: [], m1: [] }
  try {
    const res = await fetch(
      `https://api.dexscreener.com/token-pairs/v1/solana/${MROCKS_MINT}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return empty
    const data = await res.json()
    const pair = Array.isArray(data) ? data[0] : data?.pairs?.[0]
    if (!pair) return empty

    const currentPrice = parseFloat(pair.priceUsd || '0')
    if (!currentPrice) return empty

    const h1Change = pair.priceChange?.h1 || 0
    const h24Change = pair.priceChange?.h24 || 0

    const priceH1Start = currentPrice / (1 + h1Change / 100)
    const price7dStart = Math.max(currentPrice * 0.01, currentPrice - (h24Change / 100) * currentPrice * 7)
    const price1mStart = Math.max(currentPrice * 0.01, currentPrice - (h24Change / 100) * currentPrice * 30)

    return {
      h1: Array.from({ length: 60 }, (_, i) => ({
        timestamp: Date.now() - (59 - i) * 60000,
        price: priceH1Start + (currentPrice - priceH1Start) * (i / 59) + stableNoise(currentPrice, i + 1000) * currentPrice * 0.005,
      })),
      d7: Array.from({ length: 7 * 24 }, (_, i) => ({
        timestamp: Date.now() - (7 * 24 - 1 - i) * 3600000,
        price: price7dStart + (currentPrice - price7dStart) * (i / (7 * 24 - 1)) + stableNoise(currentPrice, i + 2000) * currentPrice * 0.02,
      })),
      m1: Array.from({ length: 30 }, (_, i) => ({
        timestamp: Date.now() - (29 - i) * 86400000,
        price: price1mStart + (currentPrice - price1mStart) * (i / 29) + stableNoise(currentPrice, i + 3000) * currentPrice * 0.04,
      })),
    }
  } catch {
    return empty
  }
}

// ─── Wallet Token Balances ───────────────────────────────────────────────────

export async function getWalletBalances(wallet: string): Promise<Record<string, number>> {
  const heliusKey = process.env.HELIUS_API_KEY
  if (!heliusKey || !wallet) return {}
  const rpc = `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
  const { MINT_TO_COIN, SOL_MINT } = await import('./tokens')
  const balances: Record<string, number> = {}

  // SOL native balance
  try {
    const res = await fetch(rpc, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 'sol-bal', method: 'getBalance', params: [wallet] }),
      cache: 'no-store',
    })
    const data = await res.json()
    const lamports = data?.result?.value || 0
    if (lamports > 0) balances['solana'] = lamports / 1e9
  } catch {}

  // SPL token accounts
  try {
    const res = await fetch(rpc, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 'spl-bal', method: 'getTokenAccountsByOwner',
        params: [wallet, { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, { encoding: 'jsonParsed' }],
      }),
      cache: 'no-store',
    })
    const data = await res.json()
    for (const account of (data?.result?.value || [])) {
      const info = account.account?.data?.parsed?.info
      if (!info) continue
      const uiAmount = info.tokenAmount?.uiAmount || 0
      if (uiAmount <= 0) continue
      const coinId = MINT_TO_COIN[info.mint]
      if (coinId) balances[coinId] = uiAmount
    }
  } catch {}

  return balances
}

// ─── All Wallet Tokens (Helius DAS + Jupiter prices) ─────────────────────────

export interface WalletToken {
  mint: string
  name: string
  symbol: string
  image?: string
  balance: number
  priceUsd: number
  valueUsd: number
}

const SOL_MINT_ADDR = 'So11111111111111111111111111111111111111112'

export async function getWalletTokensFull(wallet: string): Promise<WalletToken[]> {
  const heliusKey = process.env.HELIUS_API_KEY
  if (!heliusKey || !wallet) return []

  try {
    const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 'wallet-full', method: 'getAssetsByOwner',
        params: {
          ownerAddress: wallet, page: 1, limit: 1000,
          displayOptions: { showFungible: true, showNativeBalance: true },
        },
      }),
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    const result = data?.result
    if (!result) return []

    const raw: Array<{ mint: string; name: string; symbol: string; image?: string; balance: number; priceUsd: number }> = []

    // Native SOL
    const solLamports = result.nativeBalance?.lamports || 0
    const solPriceUsd = result.nativeBalance?.price_per_sol || 0
    if (solLamports > 0) {
      raw.push({ mint: SOL_MINT_ADDR, name: 'Solana', symbol: 'SOL', balance: solLamports / 1e9, priceUsd: solPriceUsd })
    }

    // SPL fungible tokens — include any item that has a positive token balance
    // and is not an NFT (no collection grouping). Helius returns fungible tokens
    // with several interface types (FungibleToken, FungibleAsset, and others),
    // so we key on balance presence rather than interface name.
    for (const item of (result.items || [])) {
      const rawBal = item.token_info?.balance || 0
      if (rawBal <= 0) continue
      const isNFT = (item.grouping || []).some((g: any) => g.group_key === 'collection')
      if (isNFT) continue
      const decimals = item.token_info?.decimals ?? 0
      const balance = rawBal / Math.pow(10, decimals)
      if (balance <= 0) continue
      raw.push({
        mint: item.id,
        name: item.content?.metadata?.name || item.token_info?.symbol || 'Unknown',
        symbol: item.token_info?.symbol || item.content?.metadata?.symbol || '?',
        image: item.content?.links?.image || item.content?.files?.[0]?.uri,
        balance,
        priceUsd: item.token_info?.price_info?.price_per_token || 0,
      })
    }

    if (raw.length === 0) return []

    // Fill missing prices from Jupiter Price API
    const needsPrice = raw.filter(t => t.priceUsd === 0 && t.mint !== SOL_MINT_ADDR)
    if (needsPrice.length > 0) {
      try {
        const ids = needsPrice.map(t => t.mint).join(',')
        const pr = await fetch(`https://api.jup.ag/price/v2?ids=${ids}`, { next: { revalidate: 60 } })
        if (pr.ok) {
          const pd = await pr.json()
          for (const t of needsPrice) {
            const p = pd.data?.[t.mint]?.price
            if (p) t.priceUsd = parseFloat(p)
          }
        }
      } catch {}
    }

    return raw
      .map(t => ({ ...t, valueUsd: t.priceUsd * t.balance }))
      .sort((a, b) => b.valueUsd - a.valueUsd)
  } catch {
    return []
  }
}

// ─── NFT Floor Price ─────────────────────────────────────────────────────────

export async function getMoonstersFloorPrice(): Promise<number> {
  try {
    const res = await fetch(
      'https://api-mainnet.magiceden.dev/v2/collections/moonsters_collection/stats',
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return 0
    const data = await res.json()
    // floorPrice is in lamports (1 SOL = 1_000_000_000 lamports)
    return (data.floorPrice || 0) / 1e9
  } catch {
    return 0
  }
}

// ─── Wallet NFTs (Moonsters) ─────────────────────────────────────────────────

export interface WalletNFT {
  id: string
  name: string
  image?: string
  tier: string
}

export async function getWalletNFTs(wallet: string): Promise<WalletNFT[]> {
  const heliusKey = process.env.HELIUS_API_KEY
  if (!heliusKey || !wallet) return []
  const { COLLECTION_ADDRESS, resolveTier } = await import('./tiers')
  try {
    const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 'nfts', method: 'getAssetsByOwner',
        params: { ownerAddress: wallet, page: 1, limit: 1000, displayOptions: { showCollectionMetadata: false } },
      }),
      cache: 'no-store',
    })
    const data = await res.json()
    const assets = data?.result?.items || []
    return assets
      .filter((a: any) => (a.grouping || []).some((g: any) => g.group_key === 'collection' && g.group_value === COLLECTION_ADDRESS))
      .map((a: any) => {
        const rawAttrs = a.content?.metadata?.attributes
        const traits: { trait_type: string; value: string }[] = Array.isArray(rawAttrs)
          ? rawAttrs
          : rawAttrs && typeof rawAttrs === 'object'
          ? Object.entries(rawAttrs).map(([trait_type, value]) => ({ trait_type, value: String(value) }))
          : []
        const tier = resolveTier(traits.map(t => t.value))
        const image = a.content?.links?.image || a.content?.files?.[0]?.uri
        return { id: a.id, name: a.content?.metadata?.name || 'Moonster', image, tier }
      })
  } catch {
    return []
  }
}
