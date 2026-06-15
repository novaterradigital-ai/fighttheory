import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

interface OddsEvent {
  id: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: Array<{
    markets: Array<{
      key: string
      outcomes: Array<{ name: string; price: number }>
    }>
  }>
}

async function fetchFights(sport: string, apiKey: string) {
  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`
    const res = await fetch(url)
    if (!res.ok) return []
    const events: OddsEvent[] = await res.json()
    return events.map((e) => ({
      event: e.sport_title,
      date: e.commence_time,
      fighter_a: e.home_team,
      fighter_b: e.away_team,
    }))
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { query } = body

    const apiKey = process.env.ODDS_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ODDS_API_KEY not configured' }, { status: 500 })

    const [mma, boxing] = await Promise.all([
      fetchFights('mma_mixed_martial_arts', apiKey),
      fetchFights('boxing_boxing', apiKey),
    ])

    const all = [...mma, ...boxing]

    const filtered = query && query !== 'upcoming'
      ? all.filter((e) =>
          e.fighter_a.toLowerCase().includes(query.toLowerCase()) ||
          e.fighter_b.toLowerCase().includes(query.toLowerCase()) ||
          e.event.toLowerCase().includes(query.toLowerCase())
        )
      : all

    if (filtered.length === 0) return NextResponse.json({ props: [], fights_found: 0 })

    const limited = filtered.slice(0, 8)

    const fightsText = limited
      .map((e) => `${e.fighter_a} vs ${e.fighter_b} — ${e.event} on ${new Date(e.date).toLocaleDateString()}`)
      .join('\n')

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: "You are Fight Theory's AI prop bet analyst. You have deep knowledge of MMA and boxing fighters' styles, finishing rates, tendencies, and recent form. Generate prop bet recommendations for upcoming fights. Be specific and analytical. Return JSON only.",
      messages: [{
        role: 'user',
        content: `Here are upcoming fights:\n\n${fightsText}\n\nFor each fight, generate 2-3 prop bet recommendations. Return a JSON array where each object has:\n- fight: "Fighter A vs Fighter B"\n- event: event name\n- date: date string\n- prop_type: one of "Over/Under Rounds", "Method of Victory", "Goes the Distance", "Round Betting", "Fighter to Win by KO/TKO", "Fighter to Win by Decision", "Fighter to Win by Submission"\n- pick: the specific bet (e.g. "Over 1.5 rounds", "Nascimento by Submission", "Fight goes the distance - No")\n- confidence: integer 1-5\n- units: 0.5 to 2 based on confidence\n- reasoning: 2-3 sentences explaining the prop based on fighter styles and tendencies\n- note: "Verify line at your sportsbook before betting"\n\nReturn ONLY the raw JSON array, no other text.`,
      }],
    })

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '[]'
    const cleaned = rawText.replace(/```json?\n?/g, '').replace(/```/g, '').trim()

    let props
    try {
      props = JSON.parse(cleaned)
    } catch {
      props = []
    }

    return NextResponse.json({ props, fights_found: limited.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Props analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
