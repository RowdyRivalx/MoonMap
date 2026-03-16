// lib/api.ts
import type { DAOToken, NewsItem, PriceHistory, SentimentData } from '@/types'

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'
const CRYPTOPANIC_BASE = 'https://cryptopanic.com/api/free/v2'

const cgHeaders: HeadersInit = process.env.COINGECKO_API_KEY
  ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
  : {}

// ─── DAO Token List ──────────────────────────────────────────────────────────

export async function getDAOTokens(ids: string[]): Promise<DAOToken[]> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    ids: ids.join(','),
    order: 'market_cap_desc',
    per_page: '50',
    page: '1',
    sparkline: 'true',
    price_change_percentage: '24h,7d',
  })

  const res = await fetch(`${COINGECKO_BASE}/coins/markets?${params}`, {
    headers: cgHeaders,
    next: { revalidate: 60 }, // cache 60s
  })

  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`)
  return res.json()
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

  const res = await fetch(`${COINGECKO_BASE}/coins/${id}/market_chart?${params}`, {
    headers: cgHeaders,
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Price history error: ${res.status}`)
  const data = await res.json()

  return (data.prices as [number, number][]).map(([timestamp, price]) => ({
    timestamp,
    price,
  }))
}

// ─── News + Sentiment ────────────────────────────────────────────────────────



export async function getDAONews(
  currencies?: string[],
  filter: 'rising' | 'hot' | 'bullish' | 'bearish' | 'important' | 'lol' = 'hot'
): Promise<NewsItem[]> {
  // Always fetch from RSS feeds
  const allNews = await getCoinGeckoNews()
  if (!allNews.length) return []

  // Filter based on keyword analysis
  switch (filter) {
    case 'bullish':
      return allNews.filter(item => scoreArticle(item.title) === 'bullish')
    case 'bearish':
      return allNews.filter(item => scoreArticle(item.title) === 'bearish')
    case 'rising':
      return allNews.filter(item => scoreArticle(item.title) === 'bullish' || scoreArticle(item.title) === 'neutral')
    case 'hot':
    default:
      return allNews
  }
}

// Fallback: Free RSS feeds via rss2json
async function getCoinGeckoNews(): Promise<NewsItem[]> {
  const feeds = [
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
  
  // Fetch all feeds in parallel, merge and sort by date
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`
      const res = await fetch(url, { next: { revalidate: 300 } })
      if (!res.ok) return []
      const data = await res.json()
      if (data.status !== 'ok' || !data.items?.length) return []
      return data.items.map((a: any, i: number) => ({
        id: Math.random(),
        title: a.title,
        url: a.link,
        source: { title: data.feed?.title || 'Crypto News', domain: new URL(a.link).hostname },
        published_at: a.pubDate || new Date().toISOString(),
        created_at: a.pubDate || new Date().toISOString(),
        votes: { positive: 0, negative: 0, important: 0, liked: 0, disliked: 0, lol: 0, toxic: 0, saved: 0, comments: 0 },
        kind: 'news' as const,
        domain: new URL(a.link).hostname,
        slug: String(i),
        metadata: { image: a.thumbnail || null, description: a.description?.replace(/<[^>]*>/g, '').slice(0, 200) },
        currencies: [],
      }))
    })
  )

  const allItems = results
    .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 50)

  return allItems
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

export async function getTokenNews(tokenId: string, tokenSymbol: string, tokenName: string): Promise<NewsItem[]> {
  const allNews = await getCoinGeckoNews()
  const aliases = TOKEN_ALIASES[tokenId] || [tokenName.toLowerCase(), tokenSymbol.toLowerCase(), `$${tokenSymbol.toLowerCase()}`]

  // Filter to articles mentioning this token
  const tokenNews = allNews.filter(item => {
    const text = (item.title + ' ' + (item.metadata?.description || '')).toLowerCase()
    return aliases.some(alias => text.includes(alias))
  })

  // If we found enough token-specific articles, return them; otherwise return all news
  return tokenNews.length >= 3 ? tokenNews : allNews.slice(0, 15)
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

export async function getMoonsterSocialPosts(tokenSymbol?: string): Promise<SocialPost[]> {
  // Fetch Nitter RSS feeds (public X mirror) for Moonster community accounts
  const nitterBase = 'https://nitter.poast.org'

  const posts: SocialPost[] = []

  // Try fetching from Nitter RSS for each account
  for (const account of MOONSTER_ACCOUNTS.slice(0, 3)) {
    try {
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`${nitterBase}/${account}/rss`)}`
      const res = await fetch(url, { next: { revalidate: 300 } })
      if (!res.ok) continue
      const data = await res.json()
      if (data.status !== 'ok' || !data.items?.length) continue

      const accountPosts = data.items.slice(0, 3).map((item: any, i: number) => ({
        id: `${account}-${i}`,
        author: data.feed?.title?.replace('Twitter / ', '') || account,
        handle: `@${account}`,
        content: item.title?.replace(/<[^>]*>/g, '') || '',
        timestamp: item.pubDate || new Date().toISOString(),
        url: item.link || `https://x.com/${account}`,
        avatar: `https://unavatar.io/twitter/${account}`,
        likes: 0,
        retweets: 0,
      }))

      posts.push(...accountPosts)
    } catch { continue }
  }

  // If no posts from Nitter, return curated placeholder posts about the token
  if (posts.length === 0 && tokenSymbol) {
    return [{
      id: 'placeholder-1',
      author: 'Moonsters Community',
      handle: '@moonsters_io',
      content: `Check out the latest ${tokenSymbol.toUpperCase()} updates and join the discussion in the Moonsters DAO community! 🌙`,
      timestamp: new Date().toISOString(),
      url: 'https://x.com/moonsters_io',
      avatar: 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54',
    }]
  }

  return posts.slice(0, 6)
}

// ─── MROCKS Token (Solana SPL) ────────────────────────────────────────────────

export const MROCKS_MINT = 'HQtEXUxNh3Hb3BgQpqW4XCq3fcHr5JYiGABu61Fg82No'

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


export async function getMROCKSHistory(hours = 24): Promise<PriceHistory[]> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${MROCKS_MINT}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    const pair = data.pairs?.[0]
    if (!pair) return []

    // DexScreener doesn't provide OHLCV in free tier, use Jupiter price history
    const jupRes = await fetch(
      `https://price.jup.ag/v6/price?ids=${MROCKS_MINT}`,
      { next: { revalidate: 60 } }
    )
    if (!jupRes.ok) return []
    const jupData = await jupRes.json()
    const currentPrice = jupData.data?.[MROCKS_MINT]?.price || 0

    // Generate a mock sparkline from current price ± price change
    const change = pair.priceChange?.h24 || 0
    const oldPrice = currentPrice / (1 + change / 100)
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (23 - i) * 3600000,
      price: oldPrice + (currentPrice - oldPrice) * (i / 23) + (Math.random() - 0.5) * currentPrice * 0.02,
    }))
  } catch {
    return []
  }
}
