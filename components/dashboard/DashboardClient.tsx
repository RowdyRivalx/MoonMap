'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, X, ExternalLink, TrendingUp, TrendingDown, Repeat2, Newspaper, Star } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Link from 'next/link'
import { formatCurrency, formatPercent, formatNumber, priceChangeColor, timeAgo } from '@/lib/utils'
import type { NewsItem, SentimentData, UserSubscription } from '@/types'
import type { MROCKSData, PriceHistory } from '@/lib/api'
import TrialBanner from './TrialBanner'
import { MOONSTER_IMG, MOONSTER_IMG_JPEG, PRIMARY_MOONSTER } from '@/lib/moonsters'
import SwapPanel from './SwapPanel'

const MROCKS_MINT = 'moon3CP11XLvrAxUPBnPtueDEJvmjqAyZwPuq7wBC1y'

interface Props {
  mrocks: MROCKSData | null
  mrocksHistory: PriceHistory[]
  news: NewsItem[]
  sentiment: SentimentData
  subscription: UserSubscription
  features: any
  watchlistCount: number
  justUpgraded: boolean
  trialExpiresAt?: string | null
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-0.5">{new Date(payload[0].payload.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
      <p className="font-semibold text-white">{formatCurrency(payload[0].value, 6)}</p>
    </div>
  )
}

export default function DashboardClient({
  mrocks, mrocksHistory, news, sentiment, subscription, features, watchlistCount, justUpgraded, trialExpiresAt
}: Props) {
  const router = useRouter()
  const [showBanner, setShowBanner] = useState(justUpgraded)
  const [showSwap, setShowSwap] = useState(false)

  const tier = subscription.tier
  const isHolder = tier === 'tier1' || tier === 'tier2' || tier === 'tier3'
  const isPro = tier === 'tier2' || tier === 'tier3'

  const change = mrocks?.price_change_pct_24h || 0
  const isUp = change >= 0
  const color = isUp ? '#10b981' : '#ef4444'

  const chartData = mrocksHistory.map(h => ({ time: h.timestamp, price: h.price }))

  // Build a fake DAOToken shape for SwapPanel
  const mrocksToken = mrocks ? {
    id: MROCKS_MINT,
    name: mrocks.name,
    symbol: mrocks.symbol,
    image: mrocks.image,
    current_price: mrocks.price,
  } as any : null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {showSwap && <SwapPanel token={mrocksToken} onClose={() => setShowSwap(false)} />}

      {showBanner && (
        <div className="mb-6 bg-violet-600/20 border border-violet-600/40 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-violet-300 text-sm font-medium">
            <Crown size={16}/> Welcome to MoonMap! You now have full MOONSTER access.
          </div>
          <button onClick={() => setShowBanner(false)} className="text-zinc-400 hover:text-zinc-200"><X size={16}/></button>
        </div>
      )}

      {(tier === 'free' || tier === 'tier1') && <TrialBanner trialExpiresAt={trialExpiresAt ?? null}/>}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Overview</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Live data · Powered by MoonMap</p>
        </div>
      </div>

      {/* Moonster trait badges strip */}
      <div className="flex items-center gap-2 mb-5 flex-wrap animate-rise-1">
        <div className="flex items-center gap-1.5">
          <div className="relative w-7 h-7 flex-shrink-0">
            <div className="absolute inset-0 rounded-full blur-md" style={{ background: 'rgba(245,158,11,0.4)' }} />
            <img src={MOONSTER_IMG} alt="Moonster" className="relative w-7 h-7 rounded-full object-cover" style={{ border: '1.5px solid rgba(245,158,11,0.4)' }} onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG_JPEG }} />
          </div>
          <span className="text-xs font-bold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>#7952</span>
        </div>
        <span className="trait-badge trait-badge-gold">⛓️ Blue Chain</span>
        <span className="trait-badge trait-badge-violet">☄️ Coin Gecko Comet</span>
        <span className="trait-badge trait-badge-cyan">👁 Green Tri Eyes</span>
        <span className="trait-badge" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: 'Space Mono, monospace', fontSize: '10px', padding: '3px 8px', borderRadius: '20px' }}>🧔 Dark Orc Red Beard</span>
        <span className="ml-auto trait-badge trait-badge-gold glow-tier3">⭐ MOONSTER</span>
      </div>

      {/* MROCKS Hero Card */}
      {mrocks ? (
        <div className="card p-6 mb-6 border border-violet-600/20 bg-gradient-to-br from-zinc-900 to-violet-950/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={mrocks.image} alt={mrocks.name} className="w-12 h-12 rounded-full border border-violet-600/30"
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG }}/>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{mrocks.name}</h2>
                  <span className="text-zinc-400 font-medium">${mrocks.symbol}</span>
                  <span className="text-xs bg-violet-600/20 text-violet-400 border border-violet-600/30 px-2 py-0.5 rounded-full">Featured</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <a href={mrocks.dexscreener_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
                    DexScreener <ExternalLink size={10}/>
                  </a>
                  <a href={`https://jup.ag/swap/SOL-${MROCKS_MINT}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
                    Jupiter <ExternalLink size={10}/>
                  </a>
                  <a href={`https://solscan.io/token/${MROCKS_MINT}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
                    Solscan <ExternalLink size={10}/>
                  </a>
                </div>
              </div>
            </div>
            <button onClick={() => setShowSwap(true)}
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
              <Repeat2 size={14}/> Swap
            </button>
          </div>

          {/* Price + chart */}
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-4xl font-bold mb-2">{formatCurrency(mrocks.price, 6)}</p>
              <div className="flex items-center gap-3 mb-4">
                <span className={`flex items-center gap-1 text-lg font-semibold ${priceChangeColor(change)}`}>
                  {isUp ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                  {formatPercent(change)} 24h
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Market Cap', value: formatCurrency(mrocks.market_cap) },
                  { label: '24h Volume', value: formatCurrency(mrocks.volume_24h) },
                  { label: 'Liquidity', value: formatCurrency(mrocks.liquidity) },
                  { label: 'Watchlist', value: `${watchlistCount} tokens` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-zinc-800/60 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 mb-1">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 24h chart */}
            <div>
              <p className="text-xs text-zinc-500 mb-2">24h Price Chart</p>
              {chartData.length > 2 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="mrocksGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis hide />
                    <YAxis hide domain={['auto', 'auto']}/>
                    <Tooltip content={<CustomTooltip />}/>
                    <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#mrocksGrad)" dot={false} activeDot={{ r: 4, fill: color }}/>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-xs text-zinc-600">Loading chart…</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-8 mb-6 text-center">
          <p className="text-zinc-400 text-sm">Loading $MROCKS data…</p>
        </div>
      )}

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sentiment */}
        <div className="card p-4">
          <h2 className="text-sm font-medium mb-3 flex items-center gap-1.5">
            Market Sentiment
            {!isPro && <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">Preview</span>}
          </h2>
          <SentimentGauge sentiment={sentiment}/>
        </div>

        {/* News */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium flex items-center gap-1.5">
              <Newspaper size={13} className="text-zinc-400"/> Latest News
            </h2>
            <Link href="/dashboard/news" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {news.slice(0, 6).map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex gap-2 group">
                {item.metadata?.image && (
                  <img src={item.metadata.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-zinc-800"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}/>
                )}
                <div className="min-w-0">
                  <p className="text-xs text-zinc-300 group-hover:text-white transition-colors leading-relaxed line-clamp-2">{item.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.source?.title} · <span suppressHydrationWarning>{timeAgo(item.published_at)}</span></p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Markets shortcut */}
      <div className="mt-6 flex items-center justify-between card p-4">
        <div className="flex items-center gap-3">
          <img src={MOONSTER_IMG} alt="MoonMap" className="w-8 h-8 rounded-lg object-cover"/>
          <div>
            <p className="text-sm font-medium">Browse all DAO tokens</p>
            <p className="text-xs text-zinc-500">Live prices, charts, and swap for 20+ governance tokens</p>
          </div>
        </div>
        <Link href="/dashboard/markets" className="btn-secondary text-sm px-4 py-2">Markets →</Link>
      </div>
    </div>
  )
}

function SentimentGauge({ sentiment }: { sentiment: SentimentData }) {
  const score = sentiment.score
  const angle = 180 + (score / 100) * 180
  return (
    <div className="text-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[160px] mx-auto">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#27272a" strokeWidth="14" strokeLinecap="round"/>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
          stroke={score >= 60 ? '#10b981' : score <= 40 ? '#ef4444' : '#f59e0b'}
          strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 251.3} 251.3`}/>
        <line x1="100" y1="100"
          x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
          y2={100 + 60 * Math.sin((angle * Math.PI) / 180)}
          stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="100" cy="100" r="4" fill="#a1a1aa"/>
      </svg>
      <div className="mt-1">
        <span className={`text-2xl font-bold ${score >= 60 ? 'text-emerald-400' : score <= 40 ? 'text-red-400' : 'text-amber-400'}`}>{score}</span>
        <span className="text-zinc-500 text-xs ml-1">/ 100</span>
      </div>
      <p className={`text-xs font-medium mt-0.5 capitalize ${score >= 60 ? 'text-emerald-400' : score <= 40 ? 'text-red-400' : 'text-amber-400'}`}>{sentiment.overall}</p>
      <div className="flex justify-between text-xs text-zinc-500 mt-2 px-2">
        <span>🐻 {sentiment.bearishCount}</span>
        <span>🐂 {sentiment.bullishCount}</span>
      </div>
    </div>
  )
}
