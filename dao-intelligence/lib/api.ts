// lib/api.ts
import type { DAOToken, NewsItem, PriceHistory, SentimentData } from '@/types'

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'
const CRYPTOPANIC_BASE = 'https://cryptopanic.com/api/v1'

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
  const params = new URLSearchParams({
    auth_token: process.env.CRYPTOPANIC_API_KEY || '',
    public: 'true',
    kind: 'news',
    filter,
  })

  if (currencies?.length) {
    params.set('currencies', currencies.join(','))
  }

  const res = await fetch(`${CRYPTOPANIC_BASE}/posts/?${params}`, {
    next: { revalidate: 120 },
  })

  if (!res.ok) {
    console.error(`CryptoPanic error: ${res.status}`)
    return []
  }

  const data = await res.json()
  return data.results || []
}

export function calculateSentiment(news: NewsItem[]): SentimentData {
  if (!news.length) return { overall: 'neutral', score: 50, bullishCount: 0, bearishCount: 0 }

  let bullishCount = 0
  let bearishCount = 0

  for (const item of news) {
    const positive = (item.votes?.positive || 0) + (item.votes?.liked || 0)
    const negative = (item.votes?.negative || 0) + (item.votes?.disliked || 0)

    if (positive > negative) bullishCount++
    else if (negative > positive) bearishCount++
  }

  const total = bullishCount + bearishCount
  const score = total === 0 ? 50 : Math.round((bullishCount / total) * 100)

  return {
    overall: score > 55 ? 'bullish' : score < 45 ? 'bearish' : 'neutral',
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
