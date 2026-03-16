'use client'
import { useState } from 'react'
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Star, Repeat2, Twitter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency, formatPercent, formatNumber, priceChangeColor, timeAgo } from '@/lib/utils'
import type { DAOToken, NewsItem, PriceHistory } from '@/types'
import type { SocialPost } from '@/lib/api'
import SwapPanel from './SwapPanel'

const MOONSTER_IMG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'

type Period = '7d' | '30d'

interface Props {
  token: any
  history30d: PriceHistory[]
  history7d: PriceHistory[]
  news: NewsItem[]
  socialPosts?: SocialPost[]
  tier: string
}

function formatChartDate(ts: number, period: Period) {
  const d = new Date(ts)
  return period === '7d'
    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-0.5">{payload[0].payload.label}</p>
      <p className="font-semibold text-white">{formatCurrency(payload[0].value, 4)}</p>
    </div>
  )
}

export default function TokenDetailClient({ token, history30d, history7d, news, socialPosts = [], tier }: Props) {
  const router = useRouter()
  const [period, setPeriod] = useState<Period>('30d')
  const [showSwap, setShowSwap] = useState(false)
  const [watchlisted, setWatchlisted] = useState(false)
  const [activeTab, setActiveTab] = useState<'news' | 'community'>('news')

  const history = period === '7d' ? history7d : history30d
  const chartData = history.map(h => ({ time: h.timestamp, price: h.price, label: formatChartDate(h.timestamp, period) }))

  const change24 = token.price_change_percentage_24h || 0
  const change7d = token.price_change_percentage_7d_in_currency || 0
  const color = change24 >= 0 ? '#10b981' : '#ef4444'
  const firstPrice = chartData[0]?.price || 0
  const lastPrice = chartData[chartData.length - 1]?.price || 0
  const periodChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0

  async function toggleWatchlist() {
    if (watchlisted) {
      await fetch('/api/data/watchlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coinId: token.id }) })
    } else {
      await fetch('/api/data/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coinId: token.id, coinName: token.name, coinSymbol: token.symbol }) })
    }
    setWatchlisted(!watchlisted)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SwapPanel token={showSwap ? token : null} onClose={() => setShowSwap(false)} />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-violet-500/10 transition-colors border border-violet-900/30">
          <ArrowLeft size={18} />
        </button>

        {/* Token badge */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: 'rgba(139,92,246,0.3)' }} />
          <div className="relative w-16 h-16 rounded-2xl border-2 border-violet-500/30 overflow-hidden shadow-[0_0_30px_rgba(124,58,237,0.3)]"
            style={{ background: 'rgba(15,8,35,0.8)' }}>
            <img src={token.image} alt={token.name} className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG }} />
          </div>
          {token.market_cap_rank && (
            <div className="absolute -bottom-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full border"
              style={{ background: 'rgba(124,58,237,0.9)', borderColor: 'rgba(167,139,250,0.4)', fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'white' }}>
              #{token.market_cap_rank}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{token.name}</h1>
            <span className="text-violet-400/60 text-base font-mono">{token.symbol?.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {token.links?.homepage?.[0] && (
              <a href={token.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">Website <ExternalLink size={10} /></a>
            )}
            {token.links?.twitter_screen_name && (
              <a href={`https://x.com/${token.links.twitter_screen_name}`} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-sky-400 flex items-center gap-1 transition-colors">
                <Twitter size={10} /> @{token.links.twitter_screen_name}
              </a>
            )}
            <a href={`https://www.dexscreener.com/search?q=${token.symbol}`} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">DexScreener <ExternalLink size={10} /></a>
            <a href={`https://jup.ag/swap/SOL-${token.symbol?.toUpperCase()}`} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">Jupiter <ExternalLink size={10} /></a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleWatchlist} className={`p-2 rounded-lg border transition-colors ${watchlisted ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200'}`}>
            <Star size={16} fill={watchlisted ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => setShowSwap(true)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Repeat2 size={15} /> Swap
          </button>
        </div>
      </div>

      {/* Price hero + stats */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-xs text-zinc-500 mb-1">Current Price</p>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-bold">{formatCurrency(token.current_price, 4)}</span>
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className={`flex items-center gap-1 font-medium ${priceChangeColor(change24)}`}>
              {change24 >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {formatPercent(change24)} 24h
            </span>
            <span className={`flex items-center gap-1 font-medium ${priceChangeColor(change7d)}`}>
              {formatPercent(change7d)} 7d
            </span>
            <span className={`font-medium ${periodChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPercent(periodChange)} {period}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Market Cap', value: formatCurrency(token.market_cap) },
            { label: '24h Volume', value: formatCurrency(token.total_volume) },
            { label: 'Circ. Supply', value: `${formatNumber(token.circulating_supply)} ${token.symbol?.toUpperCase()}` },
            { label: 'ATH', value: formatCurrency(token.ath, 4) },
          ].map(({ label, value }) => (
            <div key={label} className="card p-3">
              <p className="text-xs text-zinc-500 mb-1">{label}</p>
              <p className="font-semibold text-sm truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Price Chart</h2>
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-0.5">
            {(['7d', '30d'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === p ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 2 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a"/>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} interval="preserveStartEnd"/>
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v >= 1 ? v.toFixed(2) : v.toFixed(4)}`} width={72}/>
              <Tooltip content={<CustomTooltip />}/>
              <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#priceGrad)" dot={false} activeDot={{ r: 4, fill: color }}/>
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">No price history available</div>
        )}
      </div>

      {/* Bottom grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Token stats */}
        <div className="card p-4">
          <h2 className="text-sm font-medium mb-4">Token Stats</h2>
          <div className="space-y-2">
            {[
              { label: 'ATH Change', value: formatPercent(token.ath_change_percentage || 0), colored: true, up: (token.ath_change_percentage || 0) > 0 },
              { label: 'Community Score', value: token.community_score ? `${token.community_score.toFixed(1)} / 100` : '—' },
              { label: 'Developer Score', value: token.developer_score ? `${token.developer_score.toFixed(1)} / 100` : '—' },
              { label: 'Sentiment ↑', value: token.sentiment_votes_up_percentage ? `${token.sentiment_votes_up_percentage.toFixed(1)}%` : '—' },
              { label: 'GitHub Stars', value: token.developer_data?.stars ? formatNumber(token.developer_data.stars) : '—' },
              { label: 'GitHub Forks', value: token.developer_data?.forks ? formatNumber(token.developer_data.forks) : '—' },
              { label: 'Twitter Followers', value: token.community_data?.twitter_followers ? formatNumber(token.community_data.twitter_followers) : '—' },
              { label: 'Reddit Subscribers', value: token.community_data?.reddit_subscribers ? formatNumber(token.community_data.reddit_subscribers) : '—' },
            ].map(({ label, value, colored, up }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
                <span className="text-xs text-zinc-500">{label}</span>
                <span className={`text-sm font-medium ${colored ? (up ? 'text-emerald-400' : 'text-red-400') : ''}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* News + Community tabs */}
        <div className="card p-4">
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-0.5 mb-4">
            <button onClick={() => setActiveTab('news')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'news' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
              📰 Latest News
            </button>
            <button onClick={() => setActiveTab('community')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'community' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
              🌙 Community
            </button>
          </div>

          {activeTab === 'news' ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {news.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No articles found for {token.name}</p>
              ) : news.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="flex gap-2">
                    {item.metadata?.image && (
                      <img src={item.metadata.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-zinc-800"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}/>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-300 group-hover:text-white transition-colors leading-relaxed line-clamp-2">{item.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.source?.title} · <span suppressHydrationWarning>{timeAgo(item.published_at)}</span></p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              <div className="flex items-center gap-2 mb-2">
                <img src={MOONSTER_IMG} alt="MoonMap" className="w-5 h-5 rounded-full object-cover"/>
                <p className="text-xs text-zinc-500">Posts from Moonsters community on X</p>
              </div>
              {socialPosts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-500 mb-3">No community posts loaded</p>
                  <a href={`https://x.com/search?q=%24${token.symbol?.toUpperCase()}&src=typed_query&f=live`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-violet-400 hover:underline flex items-center gap-1 justify-center">
                    <Twitter size={12}/> Search ${token.symbol?.toUpperCase()} on X
                  </a>
                </div>
              ) : socialPosts.map(post => (
                <a key={post.id} href={post.url} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="flex gap-2">
                    <img src={post.avatar || MOONSTER_IMG} alt={post.author} className="w-8 h-8 rounded-full flex-shrink-0 bg-zinc-800 object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG }}/>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-medium text-zinc-200">{post.author}</span>
                        <span className="text-xs text-zinc-500">{post.handle}</span>
                        <span className="text-xs text-zinc-600">·</span>
                        <span className="text-xs text-zinc-500"><span suppressHydrationWarning>{timeAgo(post.timestamp)}</span></span>
                      </div>
                      <p className="text-xs text-zinc-400 group-hover:text-zinc-300 leading-relaxed line-clamp-3">{post.content}</p>
                    </div>
                  </div>
                </a>
              ))}
              <a href="https://x.com/moonsters_io" target="_blank" rel="noopener noreferrer"
                className="block text-center text-xs text-violet-400 hover:underline pt-1">
                Follow @moonsters_io →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      {token.description?.en && (
        <div className="card p-4 mt-6">
          <h2 className="text-sm font-medium mb-3">About {token.name}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-4">
            {token.description.en.replace(/<[^>]*>/g, '')}
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
        <img src={MOONSTER_IMG} alt="MoonMap" className="w-4 h-4 rounded object-cover"/>
        Data via CoinGecko · News from 18+ sources · Trading via Jupiter
      </div>
    </div>
  )
}
