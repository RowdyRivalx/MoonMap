import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const cgHeaders: HeadersInit = process.env.COINGECKO_API_KEY
  ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
  : {}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ coins: [] })

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`,
      { headers: cgHeaders, next: { revalidate: 60 } }
    )
    if (!res.ok) return NextResponse.json({ coins: [] })
    const data = await res.json()
    // Return top 12 coins with id, name, symbol, rank, thumb icon
    const coins = (data.coins || []).slice(0, 12).map((c: any) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      market_cap_rank: c.market_cap_rank ?? null,
      thumb: c.thumb,
      large: c.large,
    }))
    return NextResponse.json({ coins })
  } catch {
    return NextResponse.json({ coins: [] })
  }
}
