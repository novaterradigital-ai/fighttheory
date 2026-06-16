import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const tier = body.tier as string | undefined

    const webhookUrl = tier === 'FREE'
      ? process.env.DISCORD_WEBHOOK_PUBLIC
      : process.env.DISCORD_WEBHOOK_INNER_CIRCLE

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Discord webhook not configured for this tier' }, { status: 500 })
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: body.content }),
    })
    if (!res.ok) return NextResponse.json({ error: 'Discord post failed' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
