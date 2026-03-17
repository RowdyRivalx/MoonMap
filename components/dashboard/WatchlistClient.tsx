'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Trash2, TrendingUp, TrendingDown, Plus, Search } from 'lucide-react'
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

export default function WatchlistClient({ watchedTokens, watchlistItems, suggestedTokens, subscription, features }: Props) {
  const [items, setItems] = useState<WatchlistItem[]>(watchlistItems)
  const [watched, setWatched] = useState<DAOToken[]>(watchedTokens)
  const [suggested, setSuggested] = useState<DAOToken[]>(suggestedTokens)
  const [removing, setRemoving] = useState<string | null>(null)
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
    // Save locally first so the UI updates immediately regardless of DB state
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
      // Replace the local placeholder item id with the real DB id
      setItems(prev => prev.map(i => i.coinId === token.id ? { ...i, id: item.id } : i))
    } else if (res.status !== 503) {
      // Real error (not just DB unavailable) — roll back
      const { error } = await res.json()
      localWatchlistRemove(token.id)
      setItems(prev => prev.filter(i => i.coinId !== token.id))
      setWatched(prev => prev.filter(t => t.id !== token.id))
      setSuggested(prev => [token, ...prev].slice(0, 10))
      alert(error)
    }
  }

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

      {watched.length === 0 ? (
        <div className="card p-12 text-center">
          <Star size={32} className="text-zinc-600 mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-2">Your watchlist is empty</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Add DAO tokens from the Markets page using the ★ star icon.
          </p>
          <Link href="/dashboard/markets" className="btn-primary inline-flex items-center gap-2">
            <Search size={14} /> Browse Markets
          </Link>
        </div>
      ) : (
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
              {watched.map(token => {
                const change24 = token.price_change_percentage_24h || 0
                const change7d = token.price_change_percentage_7d_in_currency || 0
                return (
                  <tr key={token.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors cursor-pointer" onClick={() => router.push(token.id === 'mrocks' ? '/dashboard/mrocks' : `/dashboard/token/${token.id}`)}>
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
