// components/dashboard/TrialBanner.tsx
'use client'
import { useState, useEffect } from 'react'
import { Clock, ExternalLink } from 'lucide-react'

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
  const urgency = secondsLeft < 120 // red under 2 min

  if (expired) {
    return (
      <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <Clock size={15} />
          <span className="font-medium">Trial expired.</span>
          <span className="text-red-400/70">Get an NFT to restore access.</span>
        </div>
        <a
          href="https://www.tensor.trade/trade/moonsters"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Get NFT <ExternalLink size={11} />
        </a>
      </div>
    )
  }

  return (
    <div className={`mb-6 rounded-xl px-4 py-3 flex items-center justify-between border ${
      urgency
        ? 'bg-red-500/10 border-red-500/30'
        : 'bg-amber-500/10 border-amber-500/20'
    }`}>
      <div className={`flex items-center gap-2 text-sm ${urgency ? 'text-red-400' : 'text-amber-400'}`}>
        <Clock size={15} />
        <span className="font-medium tabular-nums">{timeStr}</span>
        <span className="opacity-70">remaining in your free trial — Tier 1 access</span>
      </div>
      <a
        href="https://www.tensor.trade/trade/moonsters"
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors text-white ${
          urgency ? 'bg-red-500 hover:bg-red-400' : 'bg-amber-500 hover:bg-amber-400'
        }`}
      >
        Get NFT <ExternalLink size={11} />
      </a>
    </div>
  )
}
