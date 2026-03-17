// components/dashboard/TrialBanner.tsx
'use client'
import { useState, useEffect } from 'react'
import { Clock, ExternalLink, Zap, AlertTriangle } from 'lucide-react'

interface Props {
  trialExpiresAt: string | null
}

export default function TrialBanner({ trialExpiresAt }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!trialExpiresAt) return

    function tick() {
      const ms = new Date(trialExpiresAt!).getTime() - Date.now()
      if (ms <= 0) {
        setSecondsLeft(0)
        setExpired(true)
      } else {
        setSecondsLeft(Math.ceil(ms / 1000))
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [trialExpiresAt])

  if (secondsLeft === null) return null

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`

  // Three urgency levels
  const critical = secondsLeft < 60   // under 1 min — red pulse
  const urgent   = secondsLeft < 120  // under 2 min — amber
  // else normal — subtle purple/amber

  // ── Expired state ────────────────────────────────────────────────────────────
  if (expired) {
    return (
      <div
        className="mb-6 relative overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.35)',
          boxShadow: '0 0 24px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.7), transparent)' }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            {/* Icon badge */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={16} style={{ color: '#f87171' }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#f87171', fontFamily: 'Syne, sans-serif' }}>
                Trial expired
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(248,113,113,0.65)', fontFamily: 'Space Mono, monospace' }}>
                Connect an NFT to restore full access
              </p>
            </div>
          </div>
          <a
            href="https://www.tensor.trade/trade/moonsters"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))',
              color: 'white',
              border: '1px solid rgba(239,68,68,0.5)',
              boxShadow: '0 0 16px rgba(239,68,68,0.3)',
              fontFamily: 'Bungee, Syne, sans-serif',
              letterSpacing: '0.04em',
            }}>
            Get Moonster NFT <ExternalLink size={11} />
          </a>
        </div>
      </div>
    )
  }

  // ── Active trial ──────────────────────────────────────────────────────────────
  const accentColor  = critical ? '#f87171' : urgent ? '#fbbf24' : '#a78bfa'
  const borderColor  = critical ? 'rgba(239,68,68,0.4)'  : urgent ? 'rgba(245,158,11,0.35)'  : 'rgba(139,92,246,0.3)'
  const bgColor      = critical ? 'rgba(239,68,68,0.07)' : urgent ? 'rgba(245,158,11,0.07)'  : 'rgba(139,92,246,0.07)'
  const glowColor    = critical ? 'rgba(239,68,68,0.1)'  : urgent ? 'rgba(245,158,11,0.1)'   : 'rgba(139,92,246,0.1)'
  const iconBg       = critical ? 'rgba(239,68,68,0.15)' : urgent ? 'rgba(245,158,11,0.12)'  : 'rgba(139,92,246,0.12)'
  const iconBorder   = critical ? 'rgba(239,68,68,0.3)'  : urgent ? 'rgba(245,158,11,0.28)'  : 'rgba(139,92,246,0.28)'
  const btnBg        = critical
    ? 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.85))'
    : urgent
    ? 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.85))'
    : 'linear-gradient(135deg, #7c3aed, #6d28d9)'
  const btnGlow      = critical ? 'rgba(239,68,68,0.3)' : urgent ? 'rgba(245,158,11,0.3)' : 'rgba(124,58,237,0.35)'

  // Progress (0 → 1, representing time consumed — 600s total trial)
  const totalTrial = 600
  const progress = Math.max(0, Math.min(1, (totalTrial - secondsLeft) / totalTrial))
  const progressColor = critical ? '#f87171' : urgent ? '#fbbf24' : '#a78bfa'

  return (
    <div
      className={`mb-6 relative overflow-hidden rounded-2xl ${critical ? 'pulse-glow' : ''}`}
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}>
      {/* Top accent gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

      {/* Progress bar — fills as trial time is consumed */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${progressColor}88, ${progressColor})`,
            boxShadow: `0 0 6px ${progressColor}`,
          }} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4">
        {/* Left: icon + copy */}
        <div className="flex items-center gap-3">
          {/* Animated clock icon badge */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
            <Clock size={16} style={{ color: accentColor }} />
          </div>

          <div>
            {/* Countdown + label row */}
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl font-black tabular-nums leading-none"
                style={{
                  fontFamily: 'Space Mono, monospace',
                  color: accentColor,
                  textShadow: `0 0 20px ${accentColor}88`,
                  letterSpacing: '-0.02em',
                }}>
                {timeStr}
              </span>
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: `${accentColor}99`, fontFamily: 'Space Mono, monospace' }}>
                {critical ? 'HURRY!' : urgent ? 'expiring soon' : 'remaining'}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(161,161,170,0.6)', fontFamily: 'Space Mono, monospace' }}>
              Free trial &middot; Astronaut access &middot; NFT = permanent unlock
            </p>
          </div>
        </div>

        {/* Right: CTA button */}
        <a
          href="https://www.tensor.trade/trade/moonsters"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0"
          style={{
            background: btnBg,
            color: 'white',
            border: `1px solid ${borderColor}`,
            boxShadow: `0 0 16px ${btnGlow}`,
            fontFamily: 'Bungee, Syne, sans-serif',
            letterSpacing: '0.04em',
          }}>
          <Zap size={11} />
          Get Moonster NFT
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}
