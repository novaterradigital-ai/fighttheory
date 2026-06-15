'use client'

import { useState } from 'react'

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

const ANALYSIS_CHAR_LIMIT = 200

const resultConfig = {
  WIN: { label: 'WIN', className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  LOSS: { label: 'LOSS', className: 'bg-red-500/20 text-[#b01c1c] border border-red-500/30' },
  PUSH: { label: 'PUSH', className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
  PENDING: { label: 'PENDING', className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
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

export default function PickCard({ pick }: { pick: Pick }) {
  const [expanded, setExpanded] = useState(false)
  const result = resultConfig[pick.result]
  const hasLongAnalysis = pick.analysis && pick.analysis.length > ANALYSIS_CHAR_LIMIT
  const displayedAnalysis =
    pick.analysis && !expanded && hasLongAnalysis
      ? pick.analysis.slice(0, ANALYSIS_CHAR_LIMIT) + '…'
      : pick.analysis

  const plPositive = pick.profit_loss >= 0

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-5 flex flex-col gap-4 hover:border-[#2a2a2a] transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            {pick.event_name}
          </span>
          <span className="text-xs text-gray-600">{formatDate(pick.fight_date)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {pick.tier === 'INNER_CIRCLE' && (
            <span className="px-2 py-0.5 bg-[#b01c1c]/20 text-[#b01c1c] border border-[#b01c1c]/30 text-xs font-bold uppercase tracking-widest rounded">
              VIP
            </span>
          )}
          <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-widest rounded ${result.className}`}>
            {result.label}
          </span>
        </div>
      </div>

      {/* Matchup */}
      <div className="flex items-center gap-2 text-center">
        <span className="text-white font-bold text-base flex-1 text-right">{pick.fighter_a}</span>
        <span className="text-gray-600 text-sm font-semibold flex-shrink-0">vs</span>
        <span className="text-white font-bold text-base flex-1 text-left">{pick.fighter_b}</span>
      </div>

      {/* Pick & Odds */}
      <div className="bg-[#111] rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Pick</span>
          <span className="text-xl font-black text-[#b01c1c] uppercase tracking-wide">
            {pick.pick}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Odds</span>
          <span className="text-xl font-black text-white">{formatOdds(pick.odds)}</span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Units</span>
          <span className="text-xl font-black text-white">{pick.units}u</span>
        </div>
      </div>

      {/* P/L (if result is not PENDING) */}
      {pick.result !== 'PENDING' && (
        <div className="flex items-center justify-end">
          <span
            className={`text-sm font-bold ${
              plPositive ? 'text-green-400' : 'text-[#b01c1c]'
            }`}
          >
            {plPositive ? '+' : ''}{pick.profit_loss.toFixed(2)}u
          </span>
        </div>
      )}

      {/* Analysis */}
      {pick.analysis && (
        <div className="border-t border-[#1a1a1a] pt-3">
          <p className="text-gray-400 text-sm leading-relaxed">{displayedAnalysis}</p>
          {hasLongAnalysis && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-[#b01c1c] font-semibold hover:text-[#8b1010] transition-colors duration-150 cursor-pointer"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
