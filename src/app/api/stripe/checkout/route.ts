import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { email } = body

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 6700,
            recurring: { interval: 'month' },
            product_data: {
              name: 'Fight Theory VIP',
              description: 'Monthly Inner Circle membership — premium picks & analysis',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: `${origin}/vip/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/vip`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
