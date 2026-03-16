'use client'
import { useState } from 'react'
import { ExternalLink, TrendingUp, TrendingDown, Repeat2, Copy, Check } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency, formatPercent, formatNumber, priceChangeColor } from '@/lib/utils'
import { MOONSTER_IMG, MOONSTER_IMG_JPEG } from '@/lib/moonsters'
import SwapPanel from './SwapPanel'
import type { NewsItem, PriceHistory } from '@/types'

const MROCKS_MINT = 'HQtEXUxNh3Hb3BgQpqW4XCq3fcHr5JYiGABu61Fg82No'

interface MROCKSData {
  symbol: string; name: string; mint: string; price: number
  price_change_pct_24h: number; market_cap: number
  volume_24h: number; liquidity: number; image: string
  dexscreener_url: string
}

interface Props {
  mrocks: MROCKSData | null
  history: PriceHistory[]
  news: NewsItem[]
  tier: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl text-xs shadow-xl" style={{ background: 'rgba(15,8,35,0.95)', border: '1px solid rgba(139,92,246,0.3)' }}>
      <p style={{ color: 'rgba(113,113,122,0.8)' }}>{new Date(payload[0].payload.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
      <p className="font-bold text-white">{formatCurrency(payload[0].value, 6)}</p>
    </div>
  )
}

export default function MROCKSClient({ mrocks, history, news, tier }: Props) {
  const [showSwap, setShowSwap] = useState(false)
  const [copied, setCopied] = useState(false)

  const change = mrocks?.price_change_pct_24h || 0
  const isUp = change >= 0
  const color = isUp ? '#10b981' : '#ef4444'
  const chartData = history.map(h => ({ time: h.timestamp, price: h.price }))

  const mrocksToken = { id: MROCKS_MINT, name: 'Moon Rocks', symbol: 'MROCKS', image: MOONSTER_IMG, current_price: mrocks?.price || 0 }

  function copyMint() {
    navigator.clipboard.writeText(MROCKS_MINT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SwapPanel token={showSwap ? mrocksToken : null} onClose={() => setShowSwap(false)} />

      {/* Hero header */}
      <div className="relative card p-8 mb-6 overflow-hidden holographic"
        style={{ borderColor: 'rgba(245,158,11,0.25)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), rgba(139,92,246,0.4), transparent)' }} />

        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            {/* Moonster + MROCKS badge */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-2xl" style={{ background: 'rgba(245,158,11,0.3)' }} />
              <img src={MOONSTER_IMG} alt="MROCKS"
                className="relative w-20 h-20 rounded-2xl object-cover glow-tier3"
                style={{ border: '2px solid rgba(245,158,11,0.4)' }}
                onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG_JPEG }} />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-black whitespace-nowrap"
                style={{ background: 'rgba(245,158,11,0.9)', color: '#000', fontFamily: 'Syne, sans-serif', boxShadow: '0 0 15px rgba(245,158,11,0.5)' }}>
                $MROCKS
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Moon Rocks</h1>
                <span className="trait-badge trait-badge-gold">Moonsters 404</span>
              </div>
              <p className="text-sm mb-3" style={{ color: 'rgba(161,161,170,0.8)' }}>
                The native token of the Moonsters ecosystem. Stake2Earn via Meteora.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={copyMint} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: 'rgba(167,139,250,0.8)', fontFamily: 'Space Mono, monospace' }}>
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  {MROCKS_MINT.slice(0, 8)}…{MROCKS_MINT.slice(-6)}
                </button>
                <a href={`https://dexscreener.com/solana/${MROCKS_MINT}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', color: 'rgba(167,139,250,0.7)' }}>
                  DexScreener <ExternalLink size={9} />
                </a>
                <a href={`https://solscan.io/token/${MROCKS_MINT}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', color: 'rgba(167,139,250,0.7)' }}>
                  Solscan <ExternalLink size={9} />
                </a>
                <a href="https://meteora.ag" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors"
                  style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: 'rgba(34,211,238,0.8)' }}>
                  Stake on Meteora <ExternalLink size={9} />
                </a>
              </div>
            </div>
          </div>
          <button onClick={() => setShowSwap(true)} className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            <Repeat2 size={16} /> Buy $MROCKS
          </button>
        </div>
      </div>

      {/* Price + stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Price', value: formatCurrency(mrocks?.price || 0, 6), sub: `${formatPercent(change)} 24h`, up: isUp },
          { label: 'Market Cap', value: formatCurrency(mrocks?.market_cap || 0), sub: 'Fully diluted' },
          { label: '24h Volume', value: formatCurrency(mrocks?.volume_24h || 0), sub: 'Trading activity' },
          { label: 'Liquidity', value: formatCurrency(mrocks?.liquidity || 0), sub: 'Pool depth' },
        ].map(({ label, value, sub, up }) => (
          <div key={label} className="card p-4" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(113,113,122,0.8)', fontFamily: 'Space Mono, monospace' }}>{label}</p>
            <p className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
            {sub && <p className={`text-xs mt-1 ${up !== undefined ? priceChangeColor(up ? 1 : -1) : 'text-zinc-500'}`}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Chart + ecosystem info */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card p-5" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Price Chart (24h)</h2>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold flex items-center gap-1 ${priceChangeColor(change)}`}>
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {formatPercent(change)}
              </span>
            </div>
          </div>
          {chartData.length > 2 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="mrocksGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(39,39,42,0.5)" />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v.toFixed(6)}`} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#mrocksGrad2)" dot={false} activeDot={{ r: 4, fill: color }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm" style={{ color: 'rgba(113,113,122,0.6)' }}>
              Fetching price data…
            </div>
          )}
        </div>

        {/* Ecosystem info */}
        <div className="card p-5 flex flex-col gap-4" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
          <h2 className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Ecosystem</h2>
          <div className="space-y-3">
            {[
              { label: 'Standard', value: 'Solana 404', icon: '⚡' },
              { label: 'Staking', value: 'Meteora Pool', icon: '🔒' },
              { label: 'NFT ↔ Token', value: 'Interchangeable', icon: '🔄' },
              { label: 'Earn', value: 'Fee Share', icon: '💰' },
              { label: 'Chain', value: 'Solana', icon: '🌐' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid rgba(39,39,42,0.5)' }}>
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(113,113,122,0.8)' }}>
                  <span>{icon}</span> {label}
                </span>
                <span className="text-xs font-semibold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(245,158,11,0.8)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>💡 Stake2Earn</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(161,161,170,0.7)' }}>
              Stake $MROCKS on Meteora to earn a share of transaction fees. The more you stake, the more you earn.
            </p>
            <a href="https://meteora.ag" target="_blank" rel="noopener noreferrer"
              className="mt-2 text-xs flex items-center gap-1" style={{ color: 'rgba(245,158,11,0.7)' }}>
              Open Meteora <ExternalLink size={9} />
            </a>
          </div>
        </div>
      </div>

      {/* Moonster ↔ MROCKS explainer */}
      <div className="card p-6 mb-6" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
        <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>How the 404 Ecosystem Works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: '🌙', title: 'Hold a Moonster NFT',
              desc: 'Each Moonster NFT is backed by $MROCKS tokens. Your NFT gives you dashboard access tiers based on your traits.',
              color: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.2)',
            },
            {
              icon: '🔄', title: 'NFT ↔ Token Swap',
              desc: 'The 404 standard lets you convert your Moonster NFT into $MROCKS tokens and back at any time.',
              color: 'rgba(139,92,246,0.2)', border: 'rgba(139,92,246,0.2)',
            },
            {
              icon: '💰', title: 'Stake & Earn',
              desc: 'Stake $MROCKS in the Meteora pool to earn a percentage of all buy and sell transaction fees.',
              color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.2)',
            },
          ].map(({ icon, title, desc, color, border }) => (
            <div key={title} className="p-4 rounded-xl" style={{ background: color, border: `1px solid ${border}` }}>
              <div className="text-2xl mb-2">{icon}</div>
              <h3 className="font-bold text-sm text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(161,161,170,0.8)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* News */}
      {news.length > 0 && (
        <div className="card p-5" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
          <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Latest Crypto News</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {news.slice(0, 6).map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex gap-3 group">
                {item.metadata?.image && (
                  <img src={item.metadata.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    style={{ background: 'rgba(39,39,42,0.5)' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-zinc-300 group-hover:text-white transition-colors line-clamp-2 leading-relaxed">{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(113,113,122,0.7)' }}>{item.source?.title}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
