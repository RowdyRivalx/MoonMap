'use client'

const MOONSTER_IMG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'

const FLOATERS = [
  'moonster-float moonster-1',
  'moonster-float moonster-2',
  'moonster-float moonster-3',
  'moonster-float moonster-4',
  'moonster-float moonster-5',
  'moonster-float moonster-6',
  'moonster-float moonster-7',
]

export default function MoonsterBackground() {
  return (
    <>
      <div className="nebula-orb nebula-1" />
      <div className="nebula-orb nebula-2" />
      <div className="nebula-orb nebula-3" />
      <div className="grid-overlay" />
      {FLOATERS.map((cls, i) => (
        <div key={i} className={cls}>
          <img src={MOONSTER_IMG} alt="" draggable={false} />
        </div>
      ))}
    </>
  )
}
