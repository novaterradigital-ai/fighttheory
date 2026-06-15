import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type Pick = {
  id: string
  created_at: string
  fight_date: string
  fighter_a: string
  fighter_b: string
  pick: string
  odds: string
  units: number
  result: 'WIN' | 'LOSS' | 'PUSH' | 'PENDING'
  profit_loss: number
  event_name: string
  analysis: string | null
  tier: 'FREE' | 'INNER_CIRCLE'
  is_live: boolean
}

export type Stats = {
  wins: number
  losses: number
  pushes: number
  total_picks: number
  profit_loss: number
  roi: number
  win_rate: number
}
