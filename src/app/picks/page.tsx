'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import StatsBar from '@/components/StatsBar'
import PickCard from '@/components/PickCard'

type Pick = {
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

function PickCardSkeleton() {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-3 w-32 bg-[#1a1a1a] rounded" />
        <div className="h-5 w-16 bg-[#1a1a1a] rounded" />
      </div>
      <div className="flex gap-2 items-center">
        <div className="h-5 flex-1 bg-[#1a1a1a] rounded" />
        <div className="h-3 w-6 bg-[#1a1a1a] rounded" />
        <div className="h-5 flex-1 bg-[#1a1a1a] rounded" />
      </div>
      <div className="bg-[#111] rounded-lg p-4 flex gap-4">
        <div className="h-8 flex-1 bg-[#1a1a1a] rounded" />
        <div className="h-8 flex-1 bg-[#1a1a1a] rounded" />
        <div className="h-8 flex-1 bg-[#1a1a1a] rounded" />
      </div>
    </div>
  )
}

export default function PicksPage() {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/picks')
      .then((r) => r.json())
      .then((data) => {
        setPicks(Array.isArray(data) ? data : data.picks ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            Free <span className="text-[#b01c1c]">Picks</span>
          </h1>
          <p className="text-gray-500 text-sm">Public picks — updated with every event</p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 border border-[#b01c1c]/30 rounded-full bg-[#b01c1c]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b01c1c] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#b01c1c]">AI-Powered Analysis</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10">
          <StatsBar />
        </div>

        {/* Picks Grid */}
        {error && (
          <div className="text-center py-16">
            <p className="text-gray-500">Failed to load picks. Please try again.</p>
          </div>
        )}

        {!error && (
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <PickCardSkeleton key={i} />)
              : picks.map((pick) => <PickCard key={pick.id} pick={pick} />)}
          </div>
        )}

        {!loading && !error && picks.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No picks yet. Check back soon.</p>
          </div>
        )}

        {/* VIP Teaser */}
        <div className="bg-[#0a0a0a] border border-[#b01c1c]/40 rounded-lg p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#b01c1c08_0%,_transparent_70%)] pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b01c1c]/20 border border-[#b01c1c]/30 rounded text-[#b01c1c] text-xs font-bold uppercase tracking-widest mb-4">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Inner Circle Picks Locked
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
              Unlock Our Best Picks
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Inner Circle members get access to our highest-conviction picks, early line alerts, and deep fight breakdowns not available to the public.
            </p>
            <Link
              href="/inner-circle"
              className="inline-block px-8 py-3 bg-[#b01c1c] text-white font-black uppercase tracking-widest text-sm rounded hover:bg-[#8b1010] transition-colors duration-200 cursor-pointer"
            >
              Join Inner Circle — $68 First Month, Then $98/mo
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-10 border-t border-[#1a1a1a] pt-8 pb-4 text-center">
          <p className="text-gray-600 text-xs leading-relaxed max-w-2xl mx-auto">
            Fight Theory does not facilitate wagering of any kind. All picks and analysis are provided for informational and entertainment purposes only. We are not a sportsbook and do not accept bets. Past results do not guarantee future performance. Please gamble responsibly and only wager what you can afford to lose. If you or someone you know has a gambling problem, call 1-800-GAMBLER.
          </p>
        </div>
      </div>
    </div>
  )
}
