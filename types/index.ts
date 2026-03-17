// types/index.ts

export interface DAOToken {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency: number
  market_cap: number
  total_volume: number
  circulating_supply: number
  ath: number
  ath_change_percentage: number
  sparkline_in_7d?: { price: number[] }
  governance_score?: number
  community_score?: number
  developer_score?: number
  sentiment_votes_up_percentage?: number
}

export interface NewsItem {
  id: number
  title: string
  url: string
  source: { title: string; domain: string }
  created_at: string
  votes: {
    positive: number
    negative: number
    important: number
    liked: number
    disliked: number
    lol: number
    toxic: number
    saved: number
    comments: number
  }
  currencies?: { code: string; title: string; slug: string }[]
  kind: 'news' | 'media'
  domain: string
  slug: string
  published_at: string
  metadata: { image?: string; description?: string }
}

export interface SentimentData {
  overall: 'bullish' | 'bearish' | 'neutral'
  score: number // 0-100
  bullishCount: number
  bearishCount: number
}

export interface PriceHistory {
  timestamp: number
  price: number
}

export type SubscriptionTier = 'free' | 'tier1' | 'tier2' | 'tier3'

export interface UserSubscription {
  tier: SubscriptionTier
  status: string
}

export const DAO_COINS = [
  'uniswap', 'aave', 'compound-governance-token', 'maker',
  'curve-dao-token', 'yearn-finance', 'sushi', 'balancer',
  'convex-finance', 'lido-dao', 'frax-share', 'ribbon-finance',
  'olympus', 'illuvium', 'apecoin', 'ens',
  'gitcoin', 'decentraland', 'the-sandbox', 'axie-infinity'
] as const

export const FREE_TIER_LIMIT = 5 // watchlist items
export const PRO_TIER_LIMIT = 50
