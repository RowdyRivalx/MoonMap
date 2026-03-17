'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Trash2, TrendingUp, TrendingDown, Plus, Search, BarChart2, Filter } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatPercent, priceChangeColor } from '@/lib/utils'
import type { DAOToken } from '@/types'
import type { TierFeatures, TierKey } from '@/lib/tiers'
import { localWatchlistGet, localWatchlistAdd, localWatchlistRemove } from '@/lib/watchlist-local'

interface WatchlistItem {
  id: string
  coinId: string
  coinName: string
  coinSymbol: string
  addedAt: string
}

interface Props {
  watchedTokens: DAOToken[]
  watchlistItems: WatchlistItem[]
  suggestedTokens: DAOToken[]
  subscription: { tier: TierKey | string }
  features: TierFeatures
}

// Mini horizontal bar sparkline showing distribution of gainers vs losers
function PerformanceBar({ tokens }: { tokens: DAOToken[] }) {
  const total = tokens.length
  if (total === 0) return null
  const gainers = tokens.filter(t => (t.price_change_percentage_24h || 0) > 0).length
  const losers = tokens.filter(t => (t.price_change_percentage_24h || 0) < 0).length
  const neutral = total - gainers - losers
  const gPct = Math.round((gainers / total) * 100)
  const lPct = Math.round((losers / total) * 100)
  const nPct = 100 - gPct - lPct
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[10px] font-mono mb-1.5" style={{ color: 'rgba(113,113,122,0.7)' }}>
        <span className="text-emerald-400">{gainers} up</span>
        {neutral > 0 && <span className="text-zinc-500">{neutral} flat</span>}
        <span className="text-red-400">{losers} down</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {gPct > 0 && <div className="rounded-l-full" style={{ width: `${gPct}%`, background: 'rgba(16,185,129,0.7)' }} />}
        {nPct > 0 && <div style={{ width: `${nPct}%`, background: 'rgba(113,113,122,0.3)' }} />}
        {lPct > 0 && <div className="rounded-r-full" style={{ width: `${lPct}%`, background: 'rgba(239,68,68,0.7)' }} />}
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono mt-1" style={{ color: 'rgba(113,113,122,0.5)' }}>
        <span>{gPct}%</span>
        <span>{lPct}%</span>
      </div>
    </div>
  )
}

export default function WatchlistClient({ watchedTokens, watchlistItems, suggestedTokens, subscription, features }: Props) {
  const [items, setItems] = useState<WatchlistItem[]>(watchlistItems)
  const [watched, setWatched] = useState<DAOToken[]>(watchedTokens)
  const [suggested, setSuggested] = useState<DAOToken[]>(suggestedTokens)
  const [removing, setRemoving] = useState<string | null>(null)
  const [filterQuery, setFilterQuery] = useState('')
  const router = useRouter()

  // Merge any localStorage-only items (e.g. added while DB was down)
  useEffect(() => {
    const serverIds = new Set(watchlistItems.map(i => i.coinId))
    const allTokens = [...watchedTokens, ...suggestedTokens]
    const localOnly = localWatchlistGet().filter(l => !serverIds.has(l.coinId))
    if (localOnly.length === 0) return
    const extraItems: WatchlistItem[] = localOnly.map(l => ({
      id: `local-${l.coinId}`,
      coinId: l.coinId,
      coinName: l.coinName,
      coinSymbol: l.coinSymbol,
      addedAt: new Date().toISOString(),
    }))
    const extraTokens: DAOToken[] = localOnly
      .map(l => allTokens.find(t => t.id === l.coinId))
      .filter((t): t is DAOToken => !!t)
    setItems(prev => [...prev, ...extraItems.filter(e => !prev.some(p => p.coinId === e.coinId))])
    setWatched(prev => [...prev, ...extraTokens.filter(t => !prev.some(p => p.id === t.id))])
    setSuggested(prev => prev.filter(t => !localOnly.some(l => l.coinId === t.id)))
  }, [])

  async function removeFromWatchlist(coinId: string) {
    setRemoving(coinId)
    try {
      localWatchlistRemove(coinId)
      const removedToken = watched.find(t => t.id === coinId)
      setItems(prev => prev.filter(i => i.coinId !== coinId))
      setWatched(prev => prev.filter(t => t.id !== coinId))
      if (removedToken) setSuggested(prev => [removedToken, ...prev].slice(0, 10))
      fetch('/api/data/watchlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coinId }) }).catch(() => {})
    } finally {
      setRemoving(null)
    }
  }

  async function addToWatchlist(token: DAOToken) {
    localWatchlistAdd({ coinId: token.id, coinName: token.name, coinSymbol: token.symbol })
    const newItem: WatchlistItem = { id: `local-${token.id}`, coinId: token.id, coinName: token.name, coinSymbol: token.symbol, addedAt: new Date().toISOString() }
    setItems(prev => [...prev, newItem])
    setWatched(prev => [...prev, token])
    setSuggested(prev => prev.filter(t => t.id !== token.id))
    const res = await fetch('/api/data/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinId: token.id, coinName: token.name, coinSymbol: token.symbol }),
    })
    if (res.ok) {
      const { item } = await res.json()
      setItems(prev => prev.map(i => i.coinId === token.id ? { ...i, id: item.id } : i))
    } else if (res.status !== 503) {
      const { error } = await res.json()
      localWatchlistRemove(token.id)
      setItems(prev => prev.filter(i => i.coinId !== token.id))
      setWatched(prev => prev.filter(t => t.id !== token.id))
      setSuggested(prev => [token, ...prev].slice(0, 10))
      alert(error)
    }
  }

  // Filtered watchlist by search query
  const filteredWatched = filterQuery.trim() === ''
    ? watched
    : watched.filter(t =>
        t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        t.symbol.toLowerCase().includes(filterQuery.toLowerCase())
      )

  // Portfolio value summary
  const tokensWithPrice = watched.filter(t => t.current_price > 0)
  const totalMarketCap = watched.reduce((sum, t) => sum + (t.market_cap || 0), 0)
  const avgChange24h = tokensWithPrice.length > 0
    ? tokensWithPrice.reduce((sum, t) => sum + (t.price_change_percentage_24h || 0), 0) / tokensWithPrice.length
    : 0
  const avgChange7d = tokensWithPrice.length > 0
    ? tokensWithPrice.reduce((sum, t) => sum + (t.price_change_percentage_7d_in_currency || 0), 0) / tokensWithPrice.length
    : 0
  const bestPerformer = tokensWithPrice.length > 0
    ? tokensWithPrice.reduce((best, t) => (t.price_change_percentage_24h || 0) > (best.price_change_percentage_24h || 0) ? t : best, tokensWithPrice[0])
    : null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Watchlist</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {items.length} of {features.watchlistLimit} slots used
          </p>
        </div>
        <Link href="/dashboard/markets" className="btn-secondary text-sm flex items-center gap-2">
          <Plus size={14} /> Add tokens
        </Link>
      </div>

      {/* Portfolio summary banner */}
      {watched.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="col-span-2 rounded-xl p-4"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={13} className="text-violet-400" />
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Watchlist Performance</p>
            </div>
            <div className="flex items-end gap-3">
              <div>
                <p className="text-[10px] text-zinc-500 mb-0.5">Avg 24h</p>
                <p className={`text-xl font-bold ${avgChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercent(avgChange24h)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 mb-0.5">Avg 7d</p>
                <p className={`text-xl font-bold ${avgChange7d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercent(avgChange7d)}
                </p>
              </div>
            </div>
            <PerformanceBar tokens={watched} />
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(12,6,28,0.7)', border: '1px solid rgba(139,92,246,0.12)' }}>
            <p className="text-[10px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">Combined Mkt Cap</p>
            <p className="text-lg font-bold text-white">{formatCurrency(totalMarketCap)}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">{watched.length} tokens</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(12,6,28,0.7)', border: '1px solid rgba(139,92,246,0.12)' }}>
            <p className="text-[10px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">Best 24h</p>
            {bestPerformer ? (
              <>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <img src={bestPerformer.image} alt={bestPerformer.symbol} className="w-4 h-4 rounded-full" />
                  <p className="text-sm font-bold text-white">{bestPerformer.symbol.toUpperCase()}</p>
                </div>
                <p className="text-emerald-400 text-sm font-bold">
                  {formatPercent(bestPerformer.price_change_percentage_24h || 0)}
                </p>
              </>
            ) : (
              <p className="text-zinc-600 text-xs">—</p>
            )}
          </div>
        </div>
      )}

      {watched.length === 0 ? (
        <div className="card p-12 text-center">
          {/* Dimly glowing moon illustration */}
          <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
            <div className="absolute inset-2 rounded-full"
              style={{ boxShadow: '0 0 28px 8px rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }} />
            <span className="text-5xl select-none" style={{ filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.4))' }}>🌙</span>
          </div>
          <h2 className="text-lg font-medium mb-2">Your watchlist is empty</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Add tokens from the Markets tab — use the ★ star icon to track any DAO token.
          </p>
          <Link href="/dashboard/markets" className="btn-primary inline-flex items-center gap-2">
            <Search size={14} /> Browse Markets
          </Link>
        </div>
      ) : (
        <>
          {/* Search / filter input */}
          <div className="relative mb-4">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(113,113,122,0.5)' }} />
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Filter by name or symbol…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl"
              style={{
                background: 'rgba(12,6,28,0.7)',
                border: '1px solid rgba(139,92,246,0.2)',
                color: 'var(--c-text)',
              }}
            />
          </div>

        <div className="card overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Token</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium">Price</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium">24h</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium">7d</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium hidden md:table-cell">Mkt Cap</th>
                <th className="px-4 py-3 text-xs text-zinc-500 font-medium text-center">Remove</th>
              </tr>
            </thead>
            <tbody>
              {filteredWatched.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No tokens match "{filterQuery}"
                  </td>
                </tr>
              ) : null}
              {filteredWatched.map((token, i) => {
                const change24 = token.price_change_percentage_24h || 0
                const change7d = token.price_change_percentage_7d_in_currency || 0
                const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)'
                return (
                  <tr
                    key={token.id}
                    className="border-b border-zinc-800/50 transition-colors cursor-pointer"
                    style={{ background: rowBg }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = rowBg)}
                    onClick={() => router.push(token.id === 'mrocks' ? '/dashboard/mrocks' : `/dashboard/token/${token.id}`)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={token.image} alt={token.name} className="w-7 h-7 rounded-full" />
                        <div>
                          <p className="font-medium text-sm">{token.name}</p>
                          <p className="text-xs text-zinc-500">{token.symbol?.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(token.current_price)}</td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${priceChangeColor(change24)}`}>
                      <span className="flex items-center justify-end gap-0.5">
                        {change24 > 0 ? <TrendingUp size={12} /> : change24 < 0 ? <TrendingDown size={12} /> : null}
                        {formatPercent(change24)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${priceChangeColor(change7d)}`}>
                      {formatPercent(change7d)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-400 hidden md:table-cell">
                      {formatCurrency(token.market_cap)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {token.id === 'mrocks' ? (
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ color: 'rgba(163,255,71,0.6)', background: 'rgba(163,255,71,0.06)', border: '1px solid rgba(163,255,71,0.15)' }}>pinned</span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFromWatchlist(token.id) }}
                          disabled={removing === token.id}
                          className="p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Suggested tokens */}
      {items.length < features.watchlistLimit && suggested.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Suggested DAOs to watch</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {suggested.slice(0, 5).map(token => (
              <div key={token.id} className="card p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <img src={token.image} alt={token.name} className="w-6 h-6 rounded-full" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{token.symbol?.toUpperCase()}</p>
                    <p className="text-xs text-zinc-500 truncate">{token.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{formatCurrency(token.current_price)}</span>
                  <span className={`text-xs ${priceChangeColor(token.price_change_percentage_24h || 0)}`}>
                    {formatPercent(token.price_change_percentage_24h || 0)}
                  </span>
                </div>
                <button
                  onClick={() => addToWatchlist(token)}
                  className="w-full text-xs py-1 rounded border border-zinc-700 hover:border-violet-500 hover:text-violet-400 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={10} /> Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
