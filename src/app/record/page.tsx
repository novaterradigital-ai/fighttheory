'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatOdds(odds: string) {
  const n = parseInt(odds, 10)
  if (isNaN(n)) return odds
  return n > 0 ? `+${n}` : `${n}`
}

const resultBadge = {
  WIN: 'bg-green-500/20 text-green-400 border border-green-500/30',
  LOSS: 'bg-red-500/20 text-[#b01c1c] border border-red-500/30',
  PUSH: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  PENDING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
}

export default function RecordPage() {
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

  const settled = picks.filter((p) => p.result !== 'PENDING')
  const wins = settled.filter((p) => p.result === 'WIN').length
  const losses = settled.filter((p) => p.result === 'LOSS').length
  const pushes = settled.filter((p) => p.result === 'PUSH').length
  const totalPL = settled.reduce((acc, p) => acc + p.profit_loss, 0)
  const totalUnits = picks.reduce((acc, p) => acc + p.units, 0)
  const winRate = settled.length > 0 ? (wins / settled.length) * 100 : 0

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            Full <span className="text-[#b01c1c]">Record</span>
          </h1>
          <p className="text-gray-500 text-sm">Every pick, every result — no cherry-picking</p>
        </div>

        {/* Summary Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Record', value: `${wins}-${losses}${pushes > 0 ? `-${pushes}` : ''}`, color: 'text-white' },
              {
                label: 'Total P/L',
                value: `${totalPL >= 0 ? '+' : ''}${totalPL.toFixed(1)}u`,
                color: totalPL >= 0 ? 'text-green-400' : 'text-[#b01c1c]',
              },
              { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: 'text-white' },
              { label: 'Total Picks', value: picks.length.toString(), color: 'text-white' },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {error && (
          <div className="text-center py-16">
            <p className="text-gray-500">Failed to load record. Please try again.</p>
          </div>
        )}

        {!error && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a1a1a] bg-[#050505]">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Matchup</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Pick</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Odds</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Units</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Result</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-gray-500">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="border-b border-[#111] animate-pulse">
                          {Array.from({ length: 8 }).map((__, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-3 bg-[#1a1a1a] rounded w-16" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : picks.map((pick) => {
                        const pl = pick.result !== 'PENDING' ? pick.profit_loss : null
                        return (
                          <tr
                            key={pick.id}
                            className="border-b border-[#111] hover:bg-[#0f0f0f] transition-colors duration-150"
                          >
                            <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(pick.fight_date)}</td>
                            <td className="px-4 py-3 text-gray-300 whitespace-nowrap max-w-[140px] truncate">{pick.event_name}</td>
                            <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                              {pick.fighter_a} vs {pick.fighter_b}
                            </td>
                            <td className="px-4 py-3 text-white font-bold">{pick.pick}</td>
                            <td className="px-4 py-3 text-gray-300">{formatOdds(pick.odds)}</td>
                            <td className="px-4 py-3 text-gray-300">{pick.units}u</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded ${resultBadge[pick.result]}`}>
                                {pick.result}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold">
                              {pl !== null ? (
                                <span className={pl >= 0 ? 'text-green-400' : 'text-[#b01c1c]'}>
                                  {pl >= 0 ? '+' : ''}{pl.toFixed(2)}u
                                </span>
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                </tbody>
                {/* Totals Row */}
                {!loading && picks.length > 0 && (
                  <tfoot>
                    <tr className="bg-[#050505] border-t border-[#2a2a2a]">
                      <td colSpan={5} className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500">
                        Totals
                      </td>
                      <td className="px-4 py-3 text-white font-black">{totalUnits.toFixed(1)}u</td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-500">
                        {wins}W-{losses}L{pushes > 0 ? `-${pushes}P` : ''}
                      </td>
                      <td className={`px-4 py-3 text-right font-black ${totalPL >= 0 ? 'text-green-400' : 'text-[#b01c1c]'}`}>
                        {totalPL >= 0 ? '+' : ''}{totalPL.toFixed(2)}u
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {!loading && picks.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500">No picks on record yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
