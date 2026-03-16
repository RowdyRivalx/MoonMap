'use client'
import { useState } from 'react'
import { TrendingUp, TrendingDown, PieChart, DollarSign, Wallet, ExternalLink } from 'lucide-react'
import { formatCurrency, formatPercent, priceChangeColor } from '@/lib/utils'
import { MOONSTER_IMG } from '@/lib/moonsters'
import type { DAOToken } from '@/types'
import Link from 'next/link'

interface WatchlistItem { id: string; coinId: string; coinName: string; coinSymbol: string; addedAt: string }
interface Props { tokens: DAOToken[]; watchlistItems: WatchlistItem[]; wallet: string; tier: string }

export default function PortfolioClient({ tokens, watchlistItems, wallet, tier }: Props) {
  const [holdings, setHoldings] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)

  function getHolding(coinId: string): number {
    return parseFloat(holdings[coinId] || '0') || 0
  }

  function totalValue(): number {
    return tokens.reduce((sum, t) => sum + (t.current_price || 0) * getHolding(t.id), 0)
  }

  function totalChange(): number {
    const withHoldings = tokens.filter(t => getHolding(t.id) > 0)
    if (!withHoldings.length) return 0
    const totalVal = totalValue()
    if (totalVal === 0) return 0
    return withHoldings.reduce((sum, t) => {
      const weight = (t.current_price * getHolding(t.id)) / totalVal
      return sum + (t.price_change_percentage_24h || 0) * weight
    }, 0)
  }

  const hasHoldings = tokens.some(t => getHolding(t.id) > 0)
  const total = totalValue()
  const dayChange = totalChange()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl blur-lg" style={{ background: 'rgba(124,58,237,0.3)' }} />
          <img src={MOONSTER_IMG} alt="" className="relative w-10 h-10 rounded-xl object-cover" style={{ border: '1.5px solid rgba(139,92,246,0.35)' }} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Portfolio Tracker</h1>
          <p className="text-xs" style={{ color: 'rgba(113,113,122,0.7)', fontFamily: 'Space Mono, monospace' }}>
            {wallet.slice(0,4)}…{wallet.slice(-4)} · Enter holdings to track P&L
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Portfolio Value', value: formatCurrency(total), icon: DollarSign, color: '#a78bfa' },
          { label: '24h Change', value: `${formatPercent(dayChange)}`, icon: dayChange >= 0 ? TrendingUp : TrendingDown, color: dayChange >= 0 ? '#34d399' : '#f87171' },
          { label: 'Tracked Tokens', value: `${watchlistItems.length}`, icon: PieChart, color: '#06b6d4' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <p className="text-xs" style={{ color: 'rgba(113,113,122,0.7)', fontFamily: 'Space Mono, monospace' }}>{label}</p>
            </div>
            <p className="text-xl font-black" style={{ color, fontFamily: 'Syne, sans-serif' }}>{value}</p>
          </div>
        ))}
      </div>

      {tokens.length === 0 ? (
        <div className="card p-12 text-center" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
          <Wallet size={32} className="mx-auto mb-4" style={{ color: 'rgba(113,113,122,0.4)' }} />
          <h2 className="font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No tokens in watchlist</h2>
          <p className="text-sm mb-4" style={{ color: 'rgba(113,113,122,0.7)' }}>Add tokens to your watchlist first to track your portfolio.</p>
          <Link href="/dashboard/markets" className="btn-primary inline-flex items-center gap-2 text-sm">Browse Markets</Link>
        </div>
      ) : (
        <div className="card overflow-hidden" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(139,92,246,0.08)' }}>
            <p className="text-xs font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Holdings</p>
            <p className="text-xs ml-auto" style={{ color: 'rgba(113,113,122,0.6)' }}>Click amount to edit</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(39,39,42,0.5)' }}>
                {['Token', 'Price', '24h', 'Holdings', 'Value', ''].map(h => (
                  <th key={h} className={`px-4 py-2.5 text-xs font-medium ${h === 'Token' ? 'text-left' : 'text-right'}`}
                    style={{ color: 'rgba(113,113,122,0.6)', fontFamily: 'Space Mono, monospace' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map(token => {
                const holding = getHolding(token.id)
                const value = holding * (token.current_price || 0)
                const change = token.price_change_percentage_24h || 0
                const pct = total > 0 && value > 0 ? (value / total) * 100 : 0
                return (
                  <tr key={token.id} style={{ borderBottom: '1px solid rgba(39,39,42,0.3)' }}
                    className="hover:bg-violet-500/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={token.image} alt={token.name} className="w-7 h-7 rounded-full" />
                        <div>
                          <p className="font-bold text-xs text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{token.symbol?.toUpperCase()}</p>
                          <p className="text-xs" style={{ color: 'rgba(113,113,122,0.6)' }}>{token.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-mono text-white">{formatCurrency(token.current_price)}</td>
                    <td className={`px-4 py-3 text-right text-xs font-bold ${priceChangeColor(change)}`}>{formatPercent(change)}</td>
                    <td className="px-4 py-3 text-right">
                      {editingId === token.id ? (
                        <input
                          type="number" autoFocus
                          value={holdings[token.id] || ''}
                          onChange={e => setHoldings(prev => ({ ...prev, [token.id]: e.target.value }))}
                          onBlur={() => setEditingId(null)}
                          onKeyDown={e => e.key === 'Enter' && setEditingId(null)}
                          className="w-24 text-right text-xs px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.4)', color: 'white', fontFamily: 'Space Mono, monospace' }}
                          placeholder="0.00"
                        />
                      ) : (
                        <button onClick={() => setEditingId(token.id)}
                          className="text-xs px-2 py-1 rounded-lg transition-colors"
                          style={{ color: holding > 0 ? 'white' : 'rgba(113,113,122,0.5)', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(139,92,246,0.1)', fontFamily: 'Space Mono, monospace' }}>
                          {holding > 0 ? holding.toLocaleString() : '+ Add'}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>
                      {value > 0 ? formatCurrency(value) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {pct > 0 && (
                        <div className="flex items-center gap-1 justify-end">
                          <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(39,39,42,0.5)' }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: 'rgba(139,92,246,0.6)' }} />
                          </div>
                          <span className="text-xs" style={{ color: 'rgba(113,113,122,0.6)', fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>{pct.toFixed(1)}%</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {hasHoldings && (
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(39,39,42,0.4)', background: 'rgba(124,58,237,0.04)' }}>
              <span className="text-xs font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Total Portfolio Value</span>
              <span className="font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{formatCurrency(total)}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-center mt-6" style={{ color: 'rgba(113,113,122,0.4)' }}>
        Holdings are stored locally in your browser only · Not financial advice
      </p>
    </div>
  )
}
