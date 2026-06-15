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

interface FightOdds {
  event: string
  sport: string
  date: string
  fighter_a: string
  fighter_b: string
  odds_a: number | null
  odds_b: number | null
}

async function fetchOdds(sport: string, apiKey: string): Promise<FightOdds[]> {
  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`
    const res = await fetch(url)
    if (!res.ok) return []

    const events: OddsEvent[] = await res.json()

    return events.map((e) => {
      const bookmaker = e.bookmakers?.[0]
      const market = bookmaker?.markets?.find((m) => m.key === 'h2h')
      const outcomes = market?.outcomes ?? []
      const oddsA = outcomes.find((o) => o.name === e.home_team)?.price ?? null
      const oddsB = outcomes.find((o) => o.name === e.away_team)?.price ?? null

      return {
        event: e.sport_title,
        sport: e.sport_title,
        date: e.commence_time,
        fighter_a: e.home_team,
        fighter_b: e.away_team,
        odds_a: oddsA,
        odds_b: oddsB,
      }
    })
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { query } = body

    const apiKey = process.env.ODDS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ODDS_API_KEY not configured' }, { status: 500 })
    }

    const [mmaEvents, boxingEvents] = await Promise.all([
      fetchOdds('mma_mixed_martial_arts', apiKey),
      fetchOdds('boxing_boxing', apiKey),
    ])

    const allEvents = [...mmaEvents, ...boxingEvents]

    const filtered =
      query && query !== 'upcoming'
        ? allEvents.filter(
            (e) =>
              e.fighter_a.toLowerCase().includes(query.toLowerCase()) ||
              e.fighter_b.toLowerCase().includes(query.toLowerCase()) ||
              e.event.toLowerCase().includes(query.toLowerCase())
          )
        : allEvents

    if (filtered.length === 0) {
      return NextResponse.json({ analysis: [], fights_found: 0, raw_fights: [] })
    }

    const limited = filtered.slice(0, 10)

    const oddsText = limited
      .map(
        (e) =>
          `${e.fighter_a} (${e.odds_a ?? 'N/A'}) vs ${e.fighter_b} (${e.odds_b ?? 'N/A'}) — ${e.event} on ${new Date(e.date).toLocaleDateString()}`
      )
      .join('\n')

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system:
        "You are Fight Theory's AI fight analyst. You are a sharp combat sports bettor with deep knowledge of MMA and boxing. Analyze fights with cold logic — styles, recent form, line value, matchup edges. Give confident picks with clear reasoning. Format output as JSON only — no markdown, no prose outside the JSON array.",
      messages: [
        {
          role: 'user',
          content: `Here are the current fight odds:\n\n${oddsText}\n\nAnalyze each matchup and return a JSON array. Each object must have these exact fields:\n- fight: "Fighter A vs Fighter B"\n- fighter_a: first fighter name\n- fighter_b: second fighter name  \n- odds_a: odds for fighter_a as string (e.g. "+150" or "-200")\n- odds_b: odds for fighter_b as string\n- pick: the fighter you recommend\n- odds: the American odds for your pick as string\n- confidence: integer 1-5\n- units: recommended bet size 0.5 to 3 based on confidence and value\n- reasoning: 3-4 sentence detailed breakdown of the matchup and why you like this pick\n- event: event name\n- date: fight date as YYYY-MM-DD\n\nReturn ONLY the raw JSON array, no other text.`,
        },
      ],
    })

    const rawText =
      message.content[0]?.type === 'text' ? message.content[0].text : '[]'

    const cleaned = rawText.replace(/```json?\n?/g, '').replace(/```/g, '').trim()

    let analysis
    try {
      analysis = JSON.parse(cleaned)
    } catch {
      analysis = []
    }

    return NextResponse.json({ analysis, fights_found: limited.length, raw_fights: limited })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
