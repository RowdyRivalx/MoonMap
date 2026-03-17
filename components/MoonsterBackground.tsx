'use client'

// Primary Pinata-hosted portrait (fallback)
const MOONSTER_PORTRAIT = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'

// Official moonsters.io character art — distinct monster silhouettes with transparent BGs
const CHAR_1 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-1.png'
const CHAR_2 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-2.png'
const CHAR_4 = 'https://moonsters.io/wp-content/uploads/2023/03/Character-4.png'

// Each floater has a position class + the image to show
// Different characters give visual variety; glow colors set in CSS per floater
const FLOATERS: { cls: string; src: string; fallback: string }[] = [
  { cls: 'moonster-float moonster-1', src: CHAR_1,          fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-2', src: CHAR_2,          fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-3', src: CHAR_4,          fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-4', src: CHAR_1,          fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-5', src: CHAR_2,          fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-6', src: MOONSTER_PORTRAIT, fallback: MOONSTER_PORTRAIT },
  { cls: 'moonster-float moonster-7', src: CHAR_4,          fallback: MOONSTER_PORTRAIT },
]

export default function MoonsterBackground() {
  return (
    <>
      <div className="nebula-orb nebula-1" />
      <div className="nebula-orb nebula-2" />
      <div className="nebula-orb nebula-3" />
      <div className="nebula-orb nebula-4" />
      <div className="nebula-orb nebula-5" />
      <div className="grid-overlay" />
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
