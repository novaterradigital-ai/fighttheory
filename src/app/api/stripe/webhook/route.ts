import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed'
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  const supabase = getServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as {
        customer_email?: string | null
        customer?: string | null
        customer_details?: { email?: string | null }
      }

      const email =
        session.customer_email ||
        session.customer_details?.email ||
        null

      if (email) {
        await supabase.from('subscribers').upsert(
          {
            email,
            stripe_customer_id: session.customer ?? null,
            tier: 'INNER_CIRCLE',
            subscription_status: 'active',
          },
          { onConflict: 'email' }
        )
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as { customer?: string | null }
      const customerId = subscription.customer

      if (customerId) {
        await supabase
          .from('subscribers')
          .update({ tier: 'FREE', subscription_status: 'inactive' })
          .eq('stripe_customer_id', customerId)
      }
      break
    }

    default:
      // Unhandled event type — ignore
      break
  }

  return NextResponse.json({ received: true })
}
