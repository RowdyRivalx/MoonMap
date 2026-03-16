// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCheckoutSession, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, interval } = await req.json()

    const resolvedPriceId =
      priceId ||
      (interval === 'yearly'
        ? PLANS.pro.yearlyPriceId
        : PLANS.pro.monthlyPriceId)

    if (!resolvedPriceId) {
      return NextResponse.json({ error: 'Missing price ID' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const url = await createCheckoutSession({
      userId: session.user.id,
      priceId: resolvedPriceId,
      successUrl: `${appUrl}/dashboard?upgraded=1`,
      cancelUrl: `${appUrl}/pricing`,
    })

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
