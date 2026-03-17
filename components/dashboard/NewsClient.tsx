// components/dashboard/NewsClient.tsx
'use client'
import { useState } from 'react'
import { ExternalLink, Crown, TrendingUp, Flame, ThumbsUp, ThumbsDown, Zap } from 'lucide-react'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'
import type { NewsItem, SentimentData, UserSubscription } from '@/types'

type Tab = 'hot' | 'rising' | 'bullish' | 'bearish'

interface Props {
  hotNews: NewsItem[]
  risingNews: NewsItem[]
  bullishNews: NewsItem[]
  bearishNews: NewsItem[]
  sentiment: SentimentData
  subscription: UserSubscription
}

// Returns true if the article is less than 1 hour old
function isBreaking(publishedAt: string): boolean {
  if (!publishedAt) return false
  try {
    const ms = Date.now() - new Date(publishedAt).getTime()
    return ms >= 0 && ms < 3_600_000
  } catch { return false }
}

export default function NewsClient({
  hotNews, risingNews, bullishNews, bearishNews, sentiment, subscription
}: Props) {
  const [tab, setTab] = useState<Tab>('hot')
  const tier = subscription.tier
  const isPro = tier === 'tier2' || tier === 'tier3'

  const newsMap: Record<Tab, NewsItem[]> = {
    hot: hotNews,
    rising: risingNews,
    bullish: bullishNews,
    bearish: bearishNews,
  }

  const tabs: { key: Tab; label: string; icon: any; proOnly?: boolean }[] = [
    { key: 'hot', label: 'Hot', icon: Flame },
    { key: 'rising', label: 'Rising', icon: TrendingUp, proOnly: true },
    { key: 'bullish', label: 'Bullish', icon: ThumbsUp, proOnly: true },
    { key: 'bearish', label: 'Bearish', icon: ThumbsDown, proOnly: true },
  ]

  const currentNews = newsMap[tab]

  // Sentiment color helpers
  const sColor = sentiment.score >= 60 ? '#10b981' : sentiment.score <= 40 ? '#ef4444' : '#f59e0b'
  const sLabel = sentiment.overall === 'bullish' ? 'Bullish' : sentiment.overall === 'bearish' ? 'Bearish' : 'Neutral'
  const sBg = sentiment.score >= 60 ? 'rgba(16,185,129,0.1)' : sentiment.score <= 40 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'
  const sBorder = sentiment.score >= 60 ? 'rgba(16,185,129,0.25)' : sentiment.score <= 40 ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">News & Sentiment</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Aggregated from 180+ crypto sources</p>
        </div>
      </div>

      {/* Sentiment summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Main sentiment card */}
        <div className="rounded-xl p-4 col-span-3 md:col-span-1"
          style={{ background: sBg, border: `1px solid ${sBorder}` }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Market Mood</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full font-mono"
              style={{ color: sColor, background: sBg, border: `1px solid ${sBorder}` }}>
              {sLabel}
            </span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold" style={{ color: sColor }}>{sentiment.score}</span>
            <span className="text-zinc-500 text-sm mb-1">/ 100</span>
          </div>
          <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${sentiment.score}%`, background: sColor }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1.5" style={{ color: 'rgba(113,113,122,0.6)' }}>
            <span>🐻 Bearish ({sentiment.bearishCount})</span>
            <span>🐂 Bullish ({sentiment.bullishCount})</span>
          </div>
        </div>

        {/* Bullish card */}
        <div className="rounded-xl p-4"
          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <ThumbsUp size={13} className="text-emerald-400" />
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Bullish</p>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{sentiment.bullishCount}</p>
          <p className="text-xs text-zinc-500 mt-1">signals this session</p>
          <div className="mt-2 text-xs font-medium text-emerald-400">
            {Math.round((sentiment.bullishCount / (sentiment.bullishCount + sentiment.bearishCount || 1)) * 100)}% of signals
          </div>
        </div>

        {/* Bearish card */}
        <div className="rounded-xl p-4"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <ThumbsDown size={13} className="text-red-400" />
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Bearish</p>
          </div>
          <p className="text-3xl font-bold text-red-400">{sentiment.bearishCount}</p>
          <p className="text-xs text-zinc-500 mt-1">signals this session</p>
          <div className="mt-2 text-xs font-medium text-red-400">
            {Math.round((sentiment.bearishCount / (sentiment.bullishCount + sentiment.bearishCount || 1)) * 100)}% of signals
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4">
        {tabs.map(({ key, label, icon: Icon, proOnly }) => (
          <button
            key={key}
            onClick={() => {
              if (proOnly && !isPro) return
              setTab(key)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              tab === key
                ? 'bg-violet-600 text-white shadow-lg'
                : proOnly && !isPro
                ? 'text-zinc-600 cursor-not-allowed'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            style={tab === key ? { boxShadow: '0 0 12px rgba(124,58,237,0.35)' } : {}}
          >
            <Icon size={12} />
            {label}
            {proOnly && !isPro && <Crown size={10} className="text-violet-500" />}
          </button>
        ))}
        {!isPro && (
          <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-violet-400 hover:underline flex items-center gap-1">
            <Crown size={11} /> Unlock all filters
          </a>
        )}
      </div>

      {/* News list */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.12)', background: 'rgba(12,6,28,0.5)' }}>
        {currentNews.length === 0 ? (
          <div className="px-4 py-8 text-center text-zinc-500 text-sm">
            {isPro ? 'No articles in this feed right now.' : (
              <span>
                <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Get a Moonster</a> to access this feed.
              </span>
            )}
          </div>
        ) : (
          currentNews.map((item, idx) => <NewsItemCard key={item.id} item={item} isFirst={idx === 0} />)
        )}
      </div>

      {!isPro && hotNews.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-zinc-500">
            Showing 5 of many articles.{' '}
            <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Get a Moonster</a> for unlimited news access.
          </p>
        </div>
      )}
    </div>
  )
}

function NewsItemCard({ item, isFirst }: { item: NewsItem; isFirst: boolean }) {
  const positive = (item.votes?.positive || 0) + (item.votes?.liked || 0)
  const negative = (item.votes?.negative || 0) + (item.votes?.disliked || 0)
  const total = positive + negative
  const bullishPct = total > 0 ? Math.round((positive / total) * 100) : 50
  const thumbnail = item.metadata?.image
  const breaking = isBreaking(item.published_at)

  // Determine sentiment from votes
  const sentimentTag = total > 5
    ? (bullishPct >= 60 ? 'bullish' : bullishPct <= 40 ? 'bearish' : 'neutral')
    : null

  return (
    <div className="px-4 py-4 transition-colors hover:bg-white/[0.025]"
      style={{ borderBottom: '1px solid rgba(39,39,42,0.5)' }}>
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        {thumbnail ? (
          <div className="relative flex-shrink-0">
            <img
              src={thumbnail}
              alt=""
              className="w-20 h-16 rounded-xl object-cover bg-zinc-800"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            {breaking && (
              <span className="absolute -top-1.5 -left-1.5 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.9)', color: '#fff', letterSpacing: '0.04em' }}>
                <Zap size={8} className="flex-shrink-0" /> LIVE
              </span>
            )}
          </div>
        ) : (
          <div className="relative w-20 h-16 rounded-xl bg-zinc-800 flex-shrink-0 flex items-center justify-center">
            <span className="text-2xl">📰</span>
            {breaking && (
              <span className="absolute -top-1.5 -left-1.5 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.9)', color: '#fff', letterSpacing: '0.04em' }}>
                <Zap size={8} className="flex-shrink-0" /> LIVE
              </span>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {breaking && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                <Zap size={8} /> BREAKING
              </span>
            )}
            {sentimentTag === 'bullish' && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
                🐂 BULLISH
              </span>
            )}
            {sentimentTag === 'bearish' && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.22)' }}>
                🐻 BEARISH
              </span>
            )}
            {sentimentTag === 'neutral' && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.22)' }}>
                ⚖️ NEUTRAL
              </span>
            )}
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-1"
          >
            <p className="text-sm text-zinc-200 group-hover:text-white transition-colors leading-relaxed line-clamp-2 font-medium">
              {item.title}
            </p>
            <ExternalLink size={12} className="flex-shrink-0 mt-1 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </a>

          {item.metadata?.description && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-1 leading-relaxed">
              {item.metadata.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs font-medium" style={{ color: 'rgba(139,92,246,0.7)' }}>{item.source?.title}</span>
            <span className="text-xs text-zinc-600">·</span>
            <span className="text-xs text-zinc-500"><span suppressHydrationWarning>{timeAgo(item.published_at)}</span></span>
            {item.currencies?.slice(0, 3).map((c) => (
              <span key={c.code} className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(39,39,42,0.7)', color: 'rgba(161,161,170,0.7)', border: '1px solid rgba(63,63,70,0.4)' }}>
                {c.code}
              </span>
            ))}
          </div>
        </div>

        {/* Vote sentiment bar */}
        {total > 0 && (
          <div className="flex-shrink-0 text-right min-w-[64px]">
            <div className="flex items-center justify-end gap-1 text-xs mb-1.5">
              <span className="text-emerald-400 font-mono">{positive}</span>
              <span className="text-zinc-700">/</span>
              <span className="text-red-400 font-mono">{negative}</span>
            </div>
            <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(239,68,68,0.2)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${bullishPct}%`, background: bullishPct >= 60 ? '#10b981' : bullishPct <= 40 ? '#ef4444' : '#f59e0b' }}
              />
            </div>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: bullishPct >= 60 ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.6)' }}>
              {bullishPct}% bull
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
