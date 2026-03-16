// components/dashboard/DashboardClient.tsx
'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, Newspaper, Star, Crown, X } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import Link from 'next/link'
import { formatCurrency, formatPercent, priceChangeColor, timeAgo } from '@/lib/utils'
import type { DAOToken, NewsItem, SentimentData, UserSubscription } from '@/types'
import TrialBanner from './TrialBanner'

interface Props {
  tokens: DAOToken[]
  watchlistTokens: DAOToken[]
  news: NewsItem[]
  sentiment: SentimentData
  subscription: UserSubscription
  justUpgraded: boolean
  trialExpiresAt?: string | null
}

export default function DashboardClient({
  tokens, watchlistTokens, news, sentiment, subscription, justUpgraded, trialExpiresAt
}: Props) {
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(justUpgraded)
  const isPro = subscription.tier === 'pro'

  const gainers = [...tokens].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 3)
  const losers = [...tokens].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 3)

  const totalMarketCap = tokens.reduce((sum, t) => sum + (t.market_cap || 0), 0)
  const avgChange = tokens.reduce((sum, t) => sum + (t.price_change_percentage_24h || 0), 0) / tokens.length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Upgrade success banner */}
      {showUpgradeBanner && (
        <div className="mb-6 bg-violet-600/20 border border-violet-600/40 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-violet-300 text-sm font-medium">
            <Crown size={16} /> Welcome to Pro! You now have full access to all features.
          </div>
          <button onClick={() => setShowUpgradeBanner(false)} className="text-zinc-400 hover:text-zinc-200">
            <X size={16} />
          </button>
        </div>
      )}

      <TrialBanner trialExpiresAt={trialExpiresAt ?? null} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">DAO Overview</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Live data · {tokens.length} tokens tracked
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isPro && (
            <Link href="/pricing" className="flex items-center gap-1.5 text-xs font-medium bg-violet-600/20 border border-violet-600/30 text-violet-400 px-3 py-1.5 rounded-lg hover:bg-violet-600/30 transition-colors">
              <Crown size={12} /> Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="DAO Market Cap"
          value={formatCurrency(totalMarketCap)}
          sub={`${formatPercent(avgChange)} avg 24h`}
          up={avgChange > 0}
        />
        <StatCard
          label="Market Sentiment"
          value={`${sentiment.score}%`}
          sub={sentiment.overall.charAt(0).toUpperCase() + sentiment.overall.slice(1)}
          up={sentiment.overall === 'bullish'}
          color={sentiment.overall === 'bullish' ? 'text-emerald-400' : sentiment.overall === 'bearish' ? 'text-red-400' : 'text-amber-400'}
        />
        <StatCard
          label="Top Gainer 24h"
          value={gainers[0]?.symbol?.toUpperCase() || '—'}
          sub={gainers[0] ? formatPercent(gainers[0].price_change_percentage_24h) : ''}
          up={true}
        />
        <StatCard
          label="Watchlist Tokens"
          value={String(watchlistTokens.length)}
          sub={`of ${isPro ? '50' : '5'} slots used`}
          up={null}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Token table */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium">DAO Tokens</h2>
              <Link href="/dashboard/markets" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Token</th>
                    <th className="text-right px-4 py-2 text-xs text-zinc-500 font-medium">Price</th>
                    <th className="text-right px-4 py-2 text-xs text-zinc-500 font-medium">24h</th>
                    <th className="text-right px-4 py-2 text-xs text-zinc-500 font-medium hidden md:table-cell">7d</th>
                    <th className="text-right px-4 py-2 text-xs text-zinc-500 font-medium hidden md:table-cell">Mkt Cap</th>
                    <th className="px-4 py-2 text-xs text-zinc-500 font-medium hidden lg:table-cell">7d Chart</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <TokenRow key={token.id} token={token} />
                  ))}
                </tbody>
              </table>
            </div>
            {!isPro && (
              <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-800/50 text-center">
                <p className="text-xs text-zinc-400">
                  Showing {tokens.length} of 20+ DAO tokens.{' '}
                  <Link href="/pricing" className="text-violet-400 hover:underline">Upgrade to Pro</Link> for full access.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Sentiment gauge */}
          <div className="card p-4">
            <h2 className="text-sm font-medium mb-3 flex items-center gap-1.5">
              Market Sentiment
              {!isPro && <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">Free preview</span>}
            </h2>
            <SentimentGauge sentiment={sentiment} />
          </div>

          {/* Gainers / Losers */}
          <div className="card p-4">
            <h2 className="text-sm font-medium mb-3">Top Movers 24h</h2>
            <div className="space-y-1">
              {gainers.map((t) => (
                <MoverRow key={t.id} token={t} direction="up" />
              ))}
              <div className="border-t border-zinc-800 my-2" />
              {losers.map((t) => (
                <MoverRow key={t.id} token={t} direction="down" />
              ))}
            </div>
          </div>

          {/* News */}
          <div className="card p-4">
            <h2 className="text-sm font-medium mb-3 flex items-center gap-1.5">
              <Newspaper size={13} className="text-zinc-400" /> Latest News
            </h2>
            <div className="space-y-3">
              {news.slice(0, 4).map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <p className="text-xs text-zinc-300 group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {item.source?.title} · {timeAgo(item.published_at)}
                  </p>
                </a>
              ))}
            </div>
            <Link href="/dashboard/news" className="block text-center text-xs text-violet-400 hover:text-violet-300 mt-3 transition-colors">
              View all news →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub, up, color }: {
  label: string; value: string; sub: string; up: boolean | null; color?: string
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      {sub && (
        <p className={`text-xs mt-0.5 ${color || (up === true ? 'text-emerald-500' : up === false ? 'text-red-500' : 'text-zinc-500')}`}>
          {sub}
        </p>
      )}
    </div>
  )
}

function TokenRow({ token }: { token: DAOToken }) {
  const change24 = token.price_change_percentage_24h || 0
  const change7d = token.price_change_percentage_7d_in_currency || 0
  const sparkline = token.sparkline_in_7d?.price || []

  const chartData = sparkline
    .filter((_, i) => i % Math.ceil(sparkline.length / 20) === 0)
    .map((price, i) => ({ i, price }))

  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={token.image} alt={token.name} className="w-6 h-6 rounded-full" />
          <div>
            <p className="font-medium text-xs">{token.symbol?.toUpperCase()}</p>
            <p className="text-xs text-zinc-500">{token.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-xs font-medium">
        {formatCurrency(token.current_price)}
      </td>
      <td className={`px-4 py-3 text-right text-xs font-medium ${priceChangeColor(change24)}`}>
        {formatPercent(change24)}
      </td>
      <td className={`px-4 py-3 text-right text-xs font-medium hidden md:table-cell ${priceChangeColor(change7d)}`}>
        {formatPercent(change7d)}
      </td>
      <td className="px-4 py-3 text-right text-xs text-zinc-400 hidden md:table-cell">
        {formatCurrency(token.market_cap)}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell w-20">
        {chartData.length > 2 && (
          <ResponsiveContainer width="100%" height={32}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`sg-${token.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={change7d >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={change7d >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="price"
                stroke={change7d >= 0 ? '#10b981' : '#ef4444'}
                strokeWidth={1.5}
                fill={`url(#sg-${token.id})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </td>
    </tr>
  )
}

function MoverRow({ token, direction }: { token: DAOToken; direction: 'up' | 'down' }) {
  const change = token.price_change_percentage_24h || 0
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <img src={token.image} alt={token.name} className="w-5 h-5 rounded-full" />
        <span className="text-xs font-medium">{token.symbol?.toUpperCase()}</span>
      </div>
      <span className={`text-xs font-medium ${direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
        {formatPercent(change)}
      </span>
    </div>
  )
}

function SentimentGauge({ sentiment }: { sentiment: SentimentData }) {
  const score = sentiment.score
  const angle = -90 + (score / 100) * 180

  return (
    <div className="text-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[160px] mx-auto">
        {/* Track */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#27272a" strokeWidth="14" strokeLinecap="round" />
        {/* Fill */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={score >= 60 ? '#10b981' : score <= 40 ? '#ef4444' : '#f59e0b'}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 251.3} 251.3`}
        />
        {/* Needle */}
        <line
          x1="100" y1="100"
          x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
          y2={100 + 60 * Math.sin((angle * Math.PI) / 180)}
          stroke="#a1a1aa"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="4" fill="#a1a1aa" />
      </svg>
      <div className="mt-1">
        <span className={`text-2xl font-bold ${score >= 60 ? 'text-emerald-400' : score <= 40 ? 'text-red-400' : 'text-amber-400'}`}>
          {score}
        </span>
        <span className="text-zinc-500 text-xs ml-1">/ 100</span>
      </div>
      <p className={`text-xs font-medium mt-0.5 capitalize ${score >= 60 ? 'text-emerald-400' : score <= 40 ? 'text-red-400' : 'text-amber-400'}`}>
        {sentiment.overall}
      </p>
      <div className="flex justify-between text-xs text-zinc-500 mt-2 px-2">
        <span>🐻 {sentiment.bearishCount}</span>
        <span>🐂 {sentiment.bullishCount}</span>
      </div>
    </div>
  )
}
