'use client'

import { useEffect, useState } from 'react'

type Stats = {
  wins: number
  losses: number
  pushes: number
  profit_loss: number
  roi: number
  win_rate: number
}

function SkeletonCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-6 py-4 flex flex-col gap-2 min-w-[140px] animate-pulse">
      <div className="h-3 w-16 bg-[#1a1a1a] rounded" />
      <div className="h-7 w-24 bg-[#1a1a1a] rounded" />
    </div>
  )
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.wins === 'number') {
          setStats(data)
        } else {
          setError(true)
        }
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex gap-4 min-w-max px-4 md:px-0 md:justify-center flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return null
  }

  const plPositive = stats.profit_loss >= 0
  const record = `${stats.wins}-${stats.losses}${stats.pushes > 0 ? `-${stats.pushes}` : ''}`

  const statCards = [
    {
      label: 'Record',
      value: record,
      color: 'text-white',
    },
    {
      label: 'Profit / Loss',
      value: `${plPositive ? '+' : ''}${stats.profit_loss.toFixed(1)}u`,
      color: plPositive ? 'text-green-400' : 'text-[#b01c1c]',
    },
    {
      label: 'ROI',
      value: `${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)}%`,
      color: stats.roi >= 0 ? 'text-green-400' : 'text-[#b01c1c]',
    },
    {
      label: 'Win Rate',
      value: `${stats.win_rate.toFixed(1)}%`,
      color: 'text-white',
    },
  ]

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-4 flex flex-col gap-1"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {card.label}
            </span>
            <span className={`text-xl md:text-2xl font-black ${card.color}`}>
              {card.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
