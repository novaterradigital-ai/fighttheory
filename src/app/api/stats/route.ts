import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getServiceClient()

    const { data: picks, error } = await supabase
      .from('picks')
      .select('result, profit_loss, units')
      .eq('is_live', true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const completed = picks.filter((p) => p.result !== 'PENDING')
    const wins = completed.filter((p) => p.result === 'WIN').length
    const losses = completed.filter((p) => p.result === 'LOSS').length
    const pushes = completed.filter((p) => p.result === 'PUSH').length
    const total_picks = completed.length

    const profit_loss = completed.reduce((sum, p) => sum + (p.profit_loss ?? 0), 0)

    const nonPushCompleted = completed.filter((p) => p.result !== 'PUSH')
    const win_rate =
      nonPushCompleted.length > 0 ? (wins / nonPushCompleted.length) * 100 : 0

    const totalUnits = completed.reduce((sum, p) => sum + (p.units ?? 0), 0)
    const roi = totalUnits > 0 ? (profit_loss / totalUnits) * 100 : 0

    return NextResponse.json({
      wins,
      losses,
      pushes,
      total_picks,
      profit_loss: Math.round(profit_loss * 100) / 100,
      win_rate: Math.round(win_rate * 10) / 10,
      roi: Math.round(roi * 10) / 10,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
