'use client'
import { Trophy, Crown, Star, Zap, Users, ExternalLink } from 'lucide-react'

const MOONSTER_IMG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string; rank: number }> = {
  tier3: { label: 'Comet',        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  icon: '⛓️', rank: 3 },
  tier2: { label: 'Space Debris', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.3)',  icon: '☄️', rank: 2 },
  tier1: { label: 'Holder',       color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  icon: '🌙', rank: 1 },
  free:  { label: 'Explorer',     color: '#71717a', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.2)', icon: '🔭', rank: 0 },
}

interface User {
  id: string
  walletAddress: string
  tier: string
  nftId: string | null
  lastSeen: string | null
  createdAt: string
  watchlistCount: number
  isCurrentUser: boolean
}

interface Props {
  users: User[]
  currentUserId: string
}

function tierScore(tier: string): number {
  return TIER_CONFIG[tier]?.rank ?? 0
}

export default function LeaderboardClient({ users, currentUserId }: Props) {
  const tier3 = users.filter(u => u.tier === 'tier3')
  const tier2 = users.filter(u => u.tier === 'tier2')
  const tier1 = users.filter(u => u.tier === 'tier1')
  const free  = users.filter(u => u.tier === 'free')

  const totalHolders = tier1.length + tier2.length + tier3.length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            🏆 Moonster Leaderboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(113,113,122,0.8)' }}>
            MoonMap users ranked by tier · {users.length} total holders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl px-4 py-2 text-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="text-xs" style={{ color: 'rgba(245,158,11,0.7)', fontFamily: 'Space Mono, monospace' }}>TIER 3</p>
            <p className="font-black text-xl" style={{ color: '#f59e0b', fontFamily: 'Syne, sans-serif' }}>{tier3.length}</p>
          </div>
          <div className="rounded-xl px-4 py-2 text-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <p className="text-xs" style={{ color: 'rgba(139,92,246,0.7)', fontFamily: 'Space Mono, monospace' }}>TIER 2</p>
            <p className="font-black text-xl" style={{ color: '#8b5cf6', fontFamily: 'Syne, sans-serif' }}>{tier2.length}</p>
          </div>
          <div className="rounded-xl px-4 py-2 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-xs" style={{ color: 'rgba(16,185,129,0.7)', fontFamily: 'Space Mono, monospace' }}>HOLDERS</p>
            <p className="font-black text-xl" style={{ color: '#10b981', fontFamily: 'Syne, sans-serif' }}>{totalHolders}</p>
          </div>
        </div>
      </div>

      {/* Top 3 podium if we have tier3 users */}
      {tier3.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'rgba(245,158,11,0.7)', fontFamily: 'Space Mono, monospace' }}>
            <Crown size={12}/> TIER 3 · BLUE CHAIN HOLDERS
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tier3.map((user, i) => (
              <div key={user.id} className="card p-4 relative overflow-hidden holographic glow-tier3"
                style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                <div className="absolute top-3 right-3 text-xl opacity-30">👑</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-md" style={{ background: 'rgba(245,158,11,0.3)' }} />
                    <img src={MOONSTER_IMG} alt="" className="relative w-10 h-10 rounded-full object-cover"
                      style={{ border: '2px solid rgba(245,158,11,0.4)', opacity: user.isCurrentUser ? 1 : 0.7 }} />
                    <div className="absolute -bottom-1 -right-1 text-xs">⛓️</div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {user.isCurrentUser ? '👤 You' : `${user.walletAddress.slice(0,4)}…${user.walletAddress.slice(-4)}`}
                    </p>
                    <span className="trait-badge trait-badge-gold text-xs">Comet</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                    <p className="text-xs" style={{ color: 'rgba(245,158,11,0.6)' }}>Watchlist</p>
                    <p className="font-bold text-sm" style={{ color: '#f59e0b' }}>{user.watchlistCount}</p>
                  </div>
                  <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                    <p className="text-xs" style={{ color: 'rgba(245,158,11,0.6)' }}>Rank</p>
                    <p className="font-bold text-sm" style={{ color: '#f59e0b' }}>#{i + 1}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full leaderboard table */}
      <div className="card overflow-hidden" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
          <h2 className="font-bold text-sm text-white flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            <Users size={14} style={{ color: '#8b5cf6' }}/> All MoonMap Users
          </h2>
          <span className="text-xs" style={{ color: 'rgba(113,113,122,0.6)', fontFamily: 'Space Mono, monospace' }}>
            {users.length} TOTAL
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(39,39,42,0.5)' }}>
          {users.map((user, globalIdx) => {
            const tc = TIER_CONFIG[user.tier] || TIER_CONFIG.free
            const isYou = user.isCurrentUser
            return (
              <div key={user.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors"
                style={{ background: isYou ? 'rgba(139,92,246,0.06)' : 'transparent' }}>

                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {globalIdx === 0 ? <span className="text-lg">🥇</span>
                  : globalIdx === 1 ? <span className="text-lg">🥈</span>
                  : globalIdx === 2 ? <span className="text-lg">🥉</span>
                  : <span className="text-xs font-bold" style={{ color: 'rgba(113,113,122,0.5)', fontFamily: 'Space Mono, monospace' }}>#{globalIdx + 1}</span>}
                </div>

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img src={MOONSTER_IMG} alt="" className="w-8 h-8 rounded-full object-cover"
                    style={{ border: `1.5px solid ${tc.border}`, opacity: user.tier === 'free' ? 0.4 : 0.8 }} />
                  <span className="absolute -bottom-1 -right-1 text-xs leading-none">{tc.icon}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: isYou ? 'white' : 'rgba(212,212,216,0.9)', fontFamily: isYou ? 'Syne, sans-serif' : undefined }}>
                      {isYou ? '👤 You' : `${user.walletAddress.slice(0,6)}…${user.walletAddress.slice(-4)}`}
                    </p>
                    {isYou && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>YOU</span>}
                  </div>
                  <span className="text-xs" style={{ color: tc.color, fontFamily: 'Space Mono, monospace' }}>{tc.label}</span>
                </div>

                {/* Watchlist count */}
                <div className="hidden sm:flex items-center gap-1 text-xs" style={{ color: 'rgba(113,113,122,0.6)' }}>
                  <Star size={11}/> {user.watchlistCount}
                </div>

                {/* NFT badge */}
                {user.nftId && (
                  <a href={`https://solscan.io/token/${user.nftId}`} target="_blank" rel="noopener noreferrer"
                    className="hidden md:flex items-center gap-1 text-xs transition-colors"
                    style={{ color: 'rgba(139,92,246,0.5)' }}>
                    NFT <ExternalLink size={9}/>
                  </a>
                )}

                {/* Tier badge */}
                <div className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color, fontFamily: 'Space Mono, monospace' }}>
                  {user.tier === 'tier3' ? 'T3' : user.tier === 'tier2' ? 'T2' : user.tier === 'tier1' ? 'T1' : 'FREE'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upgrade CTA for non-holders */}
      <div className="mt-6 card p-5 flex items-center justify-between"
        style={{ borderColor: 'rgba(245,158,11,0.15)', background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(8,4,22,0.9))' }}>
        <div className="flex items-center gap-3">
          <img src={MOONSTER_IMG} alt="" className="w-10 h-10 rounded-xl object-cover" style={{ border: '1px solid rgba(245,158,11,0.3)' }}/>
          <div>
            <p className="font-bold text-sm text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Want to climb the leaderboard?</p>
            <p className="text-xs" style={{ color: 'rgba(113,113,122,0.7)' }}>Get a Moonster with Blue Chain for Tier 3 status</p>
          </div>
        </div>
        <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
          className="btn-primary text-sm flex items-center gap-2 flex-shrink-0">
          <Zap size={13}/> Get a Moonster
        </a>
      </div>
    </div>
  )
}
