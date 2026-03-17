'use client'
import { useEffect, useRef } from 'react'

// Primary Pinata-hosted portrait (fallback)
const MOONSTER_PORTRAIT = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'

// Official moonsters.io character art — distinct monster silhouettes with transparent BGs
const CHAR_1 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-1.png'
const CHAR_2 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-2.png'
const CHAR_4 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-4.png'

// Each floater has a position class + the image to show
const FLOATERS: { cls: string; src: string; fallback: string }[] = [
  { cls: 'moonster-float moonster-1', src: CHAR_1,            fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-2', src: CHAR_2,            fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-3', src: CHAR_4,            fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-4', src: CHAR_1,            fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-5', src: CHAR_2,            fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-6', src: MOONSTER_PORTRAIT, fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-7', src: CHAR_4,            fallback: MOONSTER_PORTRAIT },
]

// Lightweight CSS-only particle config (no heavy canvas)
interface ParticleDef {
  top: string; left: string;
  size: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
}

const PARTICLES: ParticleDef[] = [
  { top: '12%',  left: '28%',  size: 2,   color: 'rgba(163,255,71,0.55)',  duration: 8,  delay: 0,    opacity: 0.7 },
  { top: '34%',  left: '72%',  size: 1.5, color: 'rgba(139,92,246,0.65)',  duration: 11, delay: 2,    opacity: 0.6 },
  { top: '58%',  left: '16%',  size: 2,   color: 'rgba(255,45,120,0.50)',  duration: 9,  delay: 1.5,  opacity: 0.55 },
  { top: '78%',  left: '55%',  size: 1.5, color: 'rgba(6,182,212,0.60)',   duration: 13, delay: 3,    opacity: 0.65 },
  { top: '22%',  left: '88%',  size: 1,   color: 'rgba(255,107,43,0.55)',  duration: 7,  delay: 0.8,  opacity: 0.6 },
  { top: '90%',  left: '38%',  size: 2,   color: 'rgba(245,158,11,0.50)',  duration: 10, delay: 4,    opacity: 0.5 },
  { top: '46%',  left: '48%',  size: 1,   color: 'rgba(163,255,71,0.40)',  duration: 14, delay: 2.5,  opacity: 0.45 },
  { top: '5%',   left: '62%',  size: 1.5, color: 'rgba(139,92,246,0.50)',  duration: 8,  delay: 1,    opacity: 0.55 },
  { top: '68%',  left: '82%',  size: 2,   color: 'rgba(255,45,120,0.45)',  duration: 12, delay: 5,    opacity: 0.5 },
  { top: '42%',  left: '6%',   size: 1,   color: 'rgba(6,182,212,0.45)',   duration: 9,  delay: 3.5,  opacity: 0.4 },
  { top: '15%',  left: '44%',  size: 1.5, color: 'rgba(245,158,11,0.45)',  duration: 11, delay: 0.5,  opacity: 0.5 },
  { top: '84%',  left: '20%',  size: 2,   color: 'rgba(163,255,71,0.35)',  duration: 15, delay: 6,    opacity: 0.4 },
]

// Animated scanning line (horizontal) — ultra subtle, gives a data-terminal feel
function ScanLine() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf: number
    let y = -2
    let direction = 1
    const speed = 0.06

    function step() {
      y += speed * direction
      if (y > 102) direction = -1
      if (y < -2) direction = 1
      el!.style.top = `${y}%`
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={ref}
      className="fixed left-0 right-0 pointer-events-none z-0"
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.06) 20%, rgba(139,92,246,0.12) 50%, rgba(139,92,246,0.06) 80%, transparent 100%)',
        top: '0%',
      }}
    />
  )
}

export default function MoonsterBackground() {
  return (
    <>
      {/* Nebula orbs */}
      <div className="nebula-orb nebula-1" />
      <div className="nebula-orb nebula-2" />
      <div className="nebula-orb nebula-3" />
      <div className="nebula-orb nebula-4" />
      <div className="nebula-orb nebula-5" />

      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Animated scan line — subtle data terminal feel */}
      <ScanLine />

      {/* CSS-only particles — lightweight floating dots */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            opacity: p.opacity,
            animation: `float-around ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      {/* Floating Moonster character art */}
      {FLOATERS.map(({ cls, src, fallback }, i) => (
        <div key={i} className={cls}>
          <img
            src={src}
            alt=""
            draggable={false}
            onError={e => { (e.target as HTMLImageElement).src = fallback }}
          />
        </div>
      ))}
    </>
  )
}
