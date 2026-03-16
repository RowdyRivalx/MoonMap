// components/dashboard/NewsClient.tsx
'use client'
import { useState } from 'react'
import { ExternalLink, Crown, TrendingUp, Flame, ThumbsUp, ThumbsDown } from 'lucide-react'
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

export default function NewsClient({
  hotNews, risingNews, bullishNews, bearishNews, sentiment, subscription
}: Props) {
  const [tab, setTab] = useState<Tab>('hot')
  const isPro = subscription.tier === 'pro'

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
        <div className="card p-4 col-span-3 md:col-span-1">
          <p className="text-xs text-zinc-400 mb-1">Overall Sentiment</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${sentiment.score >= 60 ? 'text-emerald-400' : sentiment.score <= 40 ? 'text-red-400' : 'text-amber-400'}`}>
              {sentiment.score}
            </span>
            <span className={`text-sm mb-0.5 capitalize font-medium ${sentiment.score >= 60 ? 'text-emerald-400' : sentiment.score <= 40 ? 'text-red-400' : 'text-amber-400'}`}>
              {sentiment.overall}
            </span>
          </div>
          <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${sentiment.score >= 60 ? 'bg-emerald-500' : sentiment.score <= 40 ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ width: `${sentiment.score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500 mt-1.5">
            <span>Bearish ({sentiment.bearishCount})</span>
            <span>Bullish ({sentiment.bullishCount})</span>
          </div>
        </div>

        <div className="card p-4">
          <p className="text-xs text-zinc-400 mb-1">Bullish signals</p>
          <p className="text-2xl font-bold text-emerald-400">{sentiment.bullishCount}</p>
          <p className="text-xs text-zinc-500 mt-1">articles this session</p>
        </div>

        <div className="card p-4">
          <p className="text-xs text-zinc-400 mb-1">Bearish signals</p>
          <p className="text-2xl font-bold text-red-400">{sentiment.bearishCount}</p>
          <p className="text-xs text-zinc-500 mt-1">articles this session</p>
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === key
                ? 'bg-violet-600 text-white'
                : proOnly && !isPro
                ? 'text-zinc-600 cursor-not-allowed'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Icon size={12} />
            {label}
            {proOnly && !isPro && <Crown size={10} className="text-violet-500" />}
          </button>
        ))}
        {!isPro && (
          <Link href="/pricing" className="ml-auto text-xs text-violet-400 hover:underline flex items-center gap-1">
            <Crown size={11} /> Unlock all filters
          </Link>
        )}
      </div>

      {/* News list */}
      <div className="card divide-y divide-zinc-800">
        {currentNews.length === 0 ? (
          <div className="px-4 py-8 text-center text-zinc-500 text-sm">
            {isPro ? 'No articles in this feed right now.' : (
              <span>
                <Link href="/pricing" className="text-violet-400 hover:underline">Upgrade to Pro</Link> to access this feed.
              </span>
            )}
          </div>
        ) : (
          currentNews.map((item) => <NewsItem key={item.id} item={item} />)
        )}
      </div>

      {!isPro && hotNews.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-zinc-500">
            Showing 5 of many articles.{' '}
            <Link href="/pricing" className="text-violet-400 hover:underline">Upgrade to Pro</Link> for unlimited news access.
          </p>
        </div>
      )}
    </div>
  )
}

function NewsItem({ item }: { item: NewsItem }) {
  const positive = (item.votes?.positive || 0) + (item.votes?.liked || 0)
  const negative = (item.votes?.negative || 0) + (item.votes?.disliked || 0)
  const total = positive + negative
  const bullishPct = total > 0 ? Math.round((positive / total) * 100) : 50

  return (
    <div className="px-4 py-4 hover:bg-zinc-800/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-1"
          >
            <p className="text-sm text-zinc-200 group-hover:text-white transition-colors leading-relaxed">
              {item.title}
            </p>
            <ExternalLink size={12} className="flex-shrink-0 mt-1 text-zinc-500 group-hover:text-zinc-300" />
          </a>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-zinc-500">{item.source?.title}</span>
            <span className="text-xs text-zinc-600">·</span>
            <span className="text-xs text-zinc-500">{timeAgo(item.published_at)}</span>
            {item.currencies?.slice(0, 3).map((c) => (
              <span key={c.code} className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                {c.code}
              </span>
            ))}
          </div>
        </div>
        {/* Vote sentiment bar */}
        {total > 0 && (
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1 text-xs mb-1">
              <span className="text-emerald-400">{positive}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-red-400">{negative}</span>
            </div>
            <div className="w-16 h-1.5 bg-red-500/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${bullishPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
