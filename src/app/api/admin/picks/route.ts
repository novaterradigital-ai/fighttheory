import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function checkAdminAuth(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password')
  return password === process.env.ADMIN_SECRET
}

function calculateProfitLoss(result: string, odds: string, units: number): number {
  if (result === 'PUSH') return 0
  if (result === 'LOSS') return -units

  // WIN
  const oddsNum = parseInt(odds.replace('+', ''), 10)
  if (oddsNum > 0) {
    return units * (oddsNum / 100)
  } else {
    return units * (100 / Math.abs(oddsNum))
  }
}

async function postDiscordWebhook(pick: {
  event_name: string
  fighter_a: string
  fighter_b: string
  pick: string
  odds: string
  units: number
  tier: string
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return

  const content = [
    '🥊 **NEW PICK — Fight Theory**',
    `**Event:** ${pick.event_name}`,
    `**Fight:** ${pick.fighter_a} vs ${pick.fighter_b}`,
    `**Pick:** ${pick.pick} (${pick.odds})`,
    `**Units:** ${pick.units}u`,
    `**Tier:** ${pick.tier}`,
  ].join('\n')

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
  } catch {
    // Non-fatal — log but don't fail the request
    console.error('Discord webhook failed')
  }
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .order('fight_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      event_name,
      fight_date,
      fighter_a,
      fighter_b,
      pick,
      odds,
      units,
      tier,
      analysis,
      is_live,
    } = body

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('picks')
      .insert({
        event_name,
        fight_date,
        fighter_a,
        fighter_b,
        pick,
        odds,
        units,
        tier,
        analysis: analysis ?? null,
        is_live: is_live ?? false,
        result: 'PENDING',
        profit_loss: 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (is_live) {
      await postDiscordWebhook({ event_name, fighter_a, fighter_b, pick, odds, units, tier })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    // If result is being set to WIN/LOSS/PUSH, calculate profit_loss
    if (fields.result && fields.result !== 'PENDING') {
      const supabase = getServiceClient()

      // Fetch current pick to get odds and units if not provided
      let odds = fields.odds
      let units = fields.units

      if (!odds || !units) {
        const { data: existing } = await supabase
          .from('picks')
          .select('odds, units')
          .eq('id', id)
          .single()

        if (existing) {
          odds = odds ?? existing.odds
          units = units ?? existing.units
        }
      }

      fields.profit_loss = calculateProfitLoss(fields.result, odds, units)
    }

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('picks')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
