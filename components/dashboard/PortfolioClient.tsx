'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, PieChart, DollarSign, Wallet, RefreshCw, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency, formatPercent, priceChangeColor } from '@/lib/utils'
import { MOONSTER_IMG } from '@/lib/moonsters'
import { COIN_TO_MINT } from '@/lib/tokens'
import type { DAOToken } from '@/types'
import type { WalletNFT, WalletToken } from '@/lib/api'
import Link from 'next/link'

// Update this to your actual donation wallet address
const DONATION_WALLET = 'EPPE69u8bFoViC4WyiQFU7fNFLfWmt66EJwBYtz1AWQj'

interface WatchlistItem { id: string; coinId: string; coinName: string; coinSymbol: string; addedAt: string }
interface Props {
  tokens: DAOToken[]
  watchlistItems: WatchlistItem[]
  wallet: string
  tier: string
  walletBalances: Record<string, number>
  walletTokensFull: WalletToken[]
  nfts: WalletNFT[]
  nftFloorPrice: number  // in SOL
}

const TIER_COLORS: Record<string, string> = {
  tier3: '#f59e0b',
  tier2: '#a78bfa',
  tier1: '#34d399',
  free: '#71717a',
}

export default function PortfolioClient({ tokens, watchlistItems, wallet, tier, walletBalances, walletTokensFull, nfts, nftFloorPrice }: Props) {
  const router = useRouter()
  const [holdings, setHoldings] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [walletLoaded, setWalletLoaded] = useState(false)
  const [copiedDonation, setCopiedDonation] = useState(false)
  const [showDust, setShowDust] = useState(false)

  // Mints already tracked in the DAO section — exclude from "other tokens"
  const daoMints = new Set(Object.values(COIN_TO_MINT))

  // Tokens from wallet not in the DAO list
  const nonDaoTokens = walletTokensFull.filter(t => !daoMints.has(t.mint))
  const mainTokens = nonDaoTokens.filter(t => t.valueUsd >= 1)
  const dustTokens = nonDaoTokens.filter(t => t.valueUsd < 1)
  const otherTokensValue = nonDaoTokens.reduce((sum, t) => sum + t.valueUsd, 0)

  function copyDonation() {
    navigator.clipboard.writeText(DONATION_WALLET)
    setCopiedDonation(true)
    setTimeout(() => setCopiedDonation(false), 2000)
  }

  // Load from localStorage on mount, then layer wallet balances on top
  useEffect(() => {
    try {
      const saved = localStorage.getItem('moonmap-portfolio-holdings')
      const stored: Record<string, string> = saved ? JSON.parse(saved) : {}
      // Wallet balances take precedence over saved values for detected tokens
      const merged: Record<string, string> = { ...stored }
      for (const [coinId, balance] of Object.entries(walletBalances)) {
        if (balance > 0) merged[coinId] = String(balance)
      }
      setHoldings(merged)
      setWalletLoaded(true)
    } catch {
      setWalletLoaded(true)
    }
  }, [])

  function updateHolding(coinId: string, value: string) {
    const next = { ...holdings, [coinId]: value }
    setHoldings(next)
    try { localStorage.setItem('moonmap-portfolio-holdings', JSON.stringify(next)) } catch {}
  }

  function getHolding(coinId: string): number {
    return parseFloat(holdings[coinId] || '0') || 0
  }

  const solPrice = tokens.find(t => t.id === 'solana')?.current_price || 0
  const nftValueUSD = nfts.length * nftFloorPrice * solPrice

  function totalValue(): number {
    const tokenValue = tokens.reduce((sum, t) => sum + (t.current_price || 0) * getHolding(t.id), 0)
    return tokenValue + nftValueUSD + otherTokensValue
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
  const detectedCount = Object.keys(walletBalances).length

  // Separate SOL from DAO tokens
  const solToken = tokens.find(t => t.id === 'solana')
  const daoTokens = tokens.filter(t => t.id !== 'solana')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl blur-lg" style={{ background: 'rgba(124,58,237,0.3)' }} />
            <img src={MOONSTER_IMG} alt="" className="relative w-10 h-10 rounded-xl object-cover" style={{ border: '1.5px solid rgba(139,92,246,0.35)' }} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Portfolio Tracker</h1>
            <p className="text-xs" style={{ color: 'rgba(113,113,122,0.7)', fontFamily: 'Space Mono, monospace' }}>
              {wallet.slice(0,4)}…{wallet.slice(-4)} · {detectedCount > 0 ? `${detectedCount} tokens detected from wallet` : 'Enter holdings to track P&L'}
            </p>
          </div>
        </div>
        <button onClick={() => router.refresh()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: 'rgba(167,139,250,0.8)' }}>
          <RefreshCw size={11} /> Refresh wallet
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Portfolio Value', value: formatCurrency(total), icon: DollarSign, color: '#a78bfa' },
          { label: '24h Change', value: formatPercent(dayChange), icon: dayChange >= 0 ? TrendingUp : TrendingDown, color: dayChange >= 0 ? '#34d399' : '#f87171' },
          { label: 'NFTs Held', value: `${nfts.length} Moonster${nfts.length !== 1 ? 's' : ''}`, icon: PieChart, color: '#f59e0b' },
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

      {/* SOL row if held */}
      {solToken && getHolding('solana') > 0 && (
        <div className="card mb-4 overflow-hidden" style={{ borderColor: 'rgba(20,241,149,0.2)' }}>
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(20,241,149,0.1)' }}>
            <p className="text-xs font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>SOL Balance</p>
          </div>
          <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-zinc-800/20 transition-colors"
            onClick={() => router.push('/dashboard/token/solana')}>
            <div className="flex items-center gap-3">
              <img src={solToken.image} alt="SOL" className="w-8 h-8 rounded-full" />
              <div>
                <p className="font-bold text-sm text-white">Solana</p>
                <p className="text-xs" style={{ color: 'rgba(113,113,122,0.6)' }}>SOL · {getHolding('solana').toLocaleString()} tokens</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>{formatCurrency(getHolding('solana') * solToken.current_price)}</p>
              <p className={`text-xs ${priceChangeColor(solToken.price_change_percentage_24h || 0)}`}>{formatPercent(solToken.price_change_percentage_24h || 0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* DAO token holdings */}
      {tokens.length === 0 ? (
        <div className="card p-12 text-center" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
          <Wallet size={32} className="mx-auto mb-4" style={{ color: 'rgba(113,113,122,0.4)' }} />
          <h2 className="font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No token data available</h2>
          <p className="text-sm mb-4" style={{ color: 'rgba(113,113,122,0.7)' }}>Could not load token prices. Check your API keys.</p>
        </div>
      ) : (
        <div className="card overflow-hidden mb-6" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(139,92,246,0.08)' }}>
            <p className="text-xs font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>DAO Token Holdings</p>
            <p className="text-xs ml-auto" style={{ color: 'rgba(113,113,122,0.6)' }}>Click row for details · Click amount to edit</p>
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
              {daoTokens.map(token => {
                const holding = getHolding(token.id)
                const value = holding * (token.current_price || 0)
                const change = token.price_change_percentage_24h || 0
                const pct = total > 0 && value > 0 ? (value / total) * 100 : 0
                const isDetected = walletBalances[token.id] !== undefined
                return (
                  <tr key={token.id} style={{ borderBottom: '1px solid rgba(39,39,42,0.3)' }}
                    className="hover:bg-violet-500/5 transition-colors cursor-pointer"
                    onClick={(e) => {
                      // Don't navigate if clicking on the holding input/button
                      if ((e.target as HTMLElement).closest('button, input')) return
                      router.push(`/dashboard/token/${token.id}`)
                    }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={token.image} alt={token.name} className="w-7 h-7 rounded-full" />
                        <div>
                          <p className="font-bold text-xs text-white flex items-center gap-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {token.symbol?.toUpperCase()}
                            {isDetected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" title="Detected in wallet" />}
                          </p>
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
                          onChange={e => updateHolding(token.id, e.target.value)}
                          onBlur={() => setEditingId(null)}
                          onKeyDown={e => e.key === 'Enter' && setEditingId(null)}
                          className="w-24 text-right text-xs px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.4)', color: 'white', fontFamily: 'Space Mono, monospace' }}
                          placeholder="0.00"
                        />
                      ) : (
                        <button onClick={e => { e.stopPropagation(); setEditingId(token.id) }}
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

      {/* Other wallet tokens */}
      {mainTokens.length > 0 && (
        <div className="card overflow-hidden mb-6" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(139,92,246,0.08)' }}>
            <p className="text-xs font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Other Wallet Tokens</p>
            <p className="text-xs font-bold" style={{ color: '#a78bfa', fontFamily: 'Space Mono, monospace' }}>{formatCurrency(mainTokens.reduce((s, t) => s + t.valueUsd, 0))}</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(39,39,42,0.5)' }}>
                {['Token', 'Balance', 'Price', 'Value'].map(h => (
                  <th key={h} className={`px-4 py-2.5 text-xs font-medium ${h === 'Token' ? 'text-left' : 'text-right'}`}
                    style={{ color: 'rgba(113,113,122,0.6)', fontFamily: 'Space Mono, monospace' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mainTokens.map(t => (
                <tr key={t.mint} style={{ borderBottom: '1px solid rgba(39,39,42,0.3)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {t.image
                        ? <img src={t.image} alt={t.symbol} className="w-7 h-7 rounded-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        : <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>{t.symbol.slice(0, 2)}</div>
                      }
                      <div>
                        <p className="font-bold text-xs text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{t.symbol}</p>
                        <p className="text-xs truncate max-w-[120px]" style={{ color: 'rgba(113,113,122,0.6)' }}>{t.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-mono text-white">{t.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                  <td className="px-4 py-3 text-right text-xs font-mono text-white">{t.priceUsd > 0 ? formatCurrency(t.priceUsd, 6) : '—'}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>{formatCurrency(t.valueUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dust */}
      {dustTokens.length > 0 && (
        <div className="card overflow-hidden mb-6" style={{ borderColor: 'rgba(113,113,122,0.1)' }}>
          <button className="w-full px-5 py-3 flex items-center justify-between" onClick={() => setShowDust(v => !v)}
            style={{ borderBottom: showDust ? '1px solid rgba(113,113,122,0.1)' : 'none' }}>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold" style={{ color: 'rgba(113,113,122,0.7)', fontFamily: 'Syne, sans-serif' }}>
                Dust · {dustTokens.length} token{dustTokens.length !== 1 ? 's' : ''} under $1
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: 'rgba(113,113,122,0.5)', fontFamily: 'Space Mono, monospace' }}>
                {formatCurrency(dustTokens.reduce((s, t) => s + t.valueUsd, 0))}
              </span>
              {showDust ? <ChevronUp size={14} style={{ color: 'rgba(113,113,122,0.5)' }} /> : <ChevronDown size={14} style={{ color: 'rgba(113,113,122,0.5)' }} />}
            </div>
          </button>
          {showDust && (
            <>
              <div className="divide-y" style={{ borderColor: 'rgba(39,39,42,0.3)' }}>
                {dustTokens.map(t => (
                  <div key={t.mint} className="px-5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {t.image
                        ? <img src={t.image} alt={t.symbol} className="w-6 h-6 rounded-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        : <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(113,113,122,0.1)', color: 'rgba(113,113,122,0.6)' }}>{t.symbol.slice(0, 2)}</div>
                      }
                      <span className="text-xs text-zinc-400">{t.symbol}</span>
                      <span className="text-xs font-mono" style={{ color: 'rgba(113,113,122,0.4)', fontSize: '9px' }}>{t.mint.slice(0, 6)}…</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono" style={{ color: 'rgba(113,113,122,0.5)' }}>
                        {t.valueUsd > 0 ? formatCurrency(t.valueUsd) : 'no price data'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(113,113,122,0.1)', background: 'rgba(113,113,122,0.03)' }}>
                <p className="text-xs flex-1" style={{ color: 'rgba(113,113,122,0.5)' }}>
                  Donate dust to support the project
                </p>
                <button onClick={copyDonation}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: 'rgba(167,139,250,0.8)', fontFamily: 'Space Mono, monospace' }}>
                  {copiedDonation ? <Check size={10} /> : <Copy size={10} />}
                  {copiedDonation ? 'Copied!' : `${DONATION_WALLET.slice(0, 6)}…${DONATION_WALLET.slice(-4)}`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* NFTs section */}
      {nfts.length > 0 && (
        <div className="card overflow-hidden" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(245,158,11,0.1)' }}>
            <p className="text-xs font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>NFT Holdings · {nfts.length} Moonster{nfts.length !== 1 ? 's' : ''}</p>
            <div className="text-right">
              {nftFloorPrice > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: 'rgba(113,113,122,0.6)', fontFamily: 'Space Mono, monospace' }}>
                    Floor {nftFloorPrice.toFixed(2)} SOL
                  </span>
                  <span className="text-xs font-bold" style={{ color: '#f59e0b', fontFamily: 'Space Mono, monospace' }}>
                    {formatCurrency(nftValueUSD)}
                  </span>
                </div>
              ) : (
                <span className="text-xs" style={{ color: 'rgba(113,113,122,0.4)', fontFamily: 'Space Mono, monospace' }}>Floor price unavailable</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
            {nfts.map(nft => (
              <div key={nft.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${TIER_COLORS[nft.tier] || '#71717a'}33`, background: 'rgba(10,5,25,0.6)' }}>
                <div className="aspect-square relative">
                  <img
                    src={nft.image || MOONSTER_IMG}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG }}
                  />
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs font-bold"
                    style={{ background: TIER_COLORS[nft.tier] || '#71717a', color: '#000', fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>
                    {nft.tier.toUpperCase()}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-bold text-white truncate" style={{ fontFamily: 'Syne, sans-serif' }}>{nft.name}</p>
                  {nftFloorPrice > 0 ? (
                    <p className="text-xs" style={{ color: '#f59e0b', fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>
                      ≈ {formatCurrency(nftFloorPrice * solPrice)}
                    </p>
                  ) : (
                    <p className="text-xs truncate" style={{ color: 'rgba(113,113,122,0.6)', fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>{nft.id.slice(0,8)}…</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {nftFloorPrice > 0 && (
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(245,158,11,0.1)', background: 'rgba(245,158,11,0.03)' }}>
              <span className="text-xs" style={{ color: 'rgba(113,113,122,0.6)', fontFamily: 'Space Mono, monospace' }}>
                {nfts.length} × {nftFloorPrice.toFixed(2)} SOL floor
              </span>
              <span className="text-xs font-bold" style={{ color: '#f59e0b', fontFamily: 'Syne, sans-serif' }}>{formatCurrency(nftValueUSD)}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-center mt-6" style={{ color: 'rgba(113,113,122,0.4)' }}>
        Holdings auto-detected from wallet · Manual overrides saved locally · Not financial advice
      </p>
    </div>
  )
}
