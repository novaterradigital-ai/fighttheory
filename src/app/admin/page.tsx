'use client'

import { useEffect, useState, useCallback } from 'react'

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

type NewPickForm = {
  event_name: string
  fight_date: string
  fighter_a: string
  fighter_b: string
  pick: string
  odds: string
  units: string
  tier: 'FREE' | 'INNER_CIRCLE'
  analysis: string
  is_live: boolean
}

function calcProfitLoss(result: string, odds: string, units: number): number {
  const o = parseInt(odds, 10)
  if (isNaN(o) || units <= 0) return 0
  if (result === 'WIN') {
    if (o > 0) return units * (o / 100)
    return units * (100 / Math.abs(o))
  }
  if (result === 'LOSS') return -units
  return 0 // PUSH
}

const emptyForm: NewPickForm = {
  event_name: '',
  fight_date: '',
  fighter_a: '',
  fighter_b: '',
  pick: '',
  odds: '',
  units: '',
  tier: 'FREE',
  analysis: '',
  is_live: true,
}

const resultBadge: Record<string, string> = {
  WIN: 'bg-green-500/20 text-green-400 border border-green-500/30',
  LOSS: 'bg-red-500/20 text-[#b01c1c] border border-red-500/30',
  PUSH: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  PENDING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [picks, setPicks] = useState<Pick[]>([])
  const [loadingPicks, setLoadingPicks] = useState(false)
  const [form, setForm] = useState<NewPickForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Check session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('ft_admin_authed')
    if (stored === 'true') setAuthed(true)
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const secret = process.env.NEXT_PUBLIC_ADMIN_HINT ?? ''
    // Compare against ADMIN_SECRET via env var exposed for client (or use api endpoint)
    // For simplicity: post to /api/admin/auth
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          sessionStorage.setItem('ft_admin_authed', 'true')
          sessionStorage.setItem('ft_admin_password', password)
          setAuthed(true)
          setAuthError('')
        } else {
          setAuthError('Incorrect password.')
        }
      })
      .catch(() => setAuthError('Auth failed. Try again.'))
    void secret
  }

  function logout() {
    sessionStorage.removeItem('ft_admin_authed')
    sessionStorage.removeItem('ft_admin_password')
    setAuthed(false)
    setPassword('')
  }

  function getAdminPassword() {
    return sessionStorage.getItem('ft_admin_password') ?? ''
  }

  const loadPicks = useCallback(() => {
    setLoadingPicks(true)
    fetch('/api/admin/picks', {
      headers: { 'x-admin-password': getAdminPassword() },
    })
      .then((r) => r.json())
      .then((data) => {
        setPicks(Array.isArray(data) ? data : data.picks ?? [])
        setLoadingPicks(false)
      })
      .catch(() => setLoadingPicks(false))
  }, [])

  useEffect(() => {
    if (authed) loadPicks()
  }, [authed, loadPicks])

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = e.target
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  async function handleSubmitPick(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    if (!form.event_name || !form.fight_date || !form.fighter_a || !form.fighter_b || !form.pick || !form.odds) {
      setFormError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/picks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': getAdminPassword(),
        },
        body: JSON.stringify({
          ...form,
          units: parseFloat(form.units),
          result: 'PENDING',
          profit_loss: 0,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setFormSuccess('Pick added successfully!')
        setForm(emptyForm)
        loadPicks()
      } else {
        setFormError(data.error ?? 'Failed to add pick.')
      }
    } catch {
      setFormError('Request failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateResult(pick: Pick, result: 'WIN' | 'LOSS' | 'PUSH') {
    const profit_loss = calcProfitLoss(result, pick.odds, pick.units)
    try {
      const res = await fetch(`/api/admin/picks/${pick.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': getAdminPassword(),
        },
        body: JSON.stringify({ result, profit_loss }),
      })
      if (res.ok) {
        setPicks((prev) =>
          prev.map((p) => (p.id === pick.id ? { ...p, result, profit_loss } : p))
        )
      }
    } catch {
      // silently fail
    }
  }

  async function handleToggleLive(pick: Pick) {
    const is_live = !pick.is_live
    try {
      const res = await fetch(`/api/admin/picks/${pick.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': getAdminPassword(),
        },
        body: JSON.stringify({ is_live }),
      })
      if (res.ok) {
        setPicks((prev) => prev.map((p) => (p.id === pick.id ? { ...p, is_live } : p)))
      }
    } catch {
      // silently fail
    }
  }

  const totalPL = picks.filter((p) => p.result !== 'PENDING').reduce((acc, p) => acc + p.profit_loss, 0)
  const wins = picks.filter((p) => p.result === 'WIN').length
  const losses = picks.filter((p) => p.result === 'LOSS').length

  // --- Login Gate ---
  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-8 w-full max-w-sm">
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src="/logo.png" alt="Fight Theory" className="h-12 w-auto object-contain" />
            <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Admin</span>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Admin Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm outline-none focus:border-[#b01c1c] transition-colors duration-150"
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>
            {authError && (
              <p className="text-[#b01c1c] text-sm">{authError}</p>
            )}
            <button
              type="submit"
              className="py-3 bg-[#b01c1c] text-white font-black uppercase tracking-widest text-sm rounded hover:bg-[#8b1010] transition-colors duration-200 cursor-pointer"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  // --- Admin Dashboard ---
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Admin Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-[#1a1a1a] h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Fight Theory" className="h-8 w-auto object-contain" />
          <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Admin</span>
        </div>
        <button
          onClick={logout}
          className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer font-semibold uppercase tracking-widest"
        >
          Logout
        </button>
      </div>

      <div className="pt-20 pb-16 px-4 max-w-6xl mx-auto">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Record', value: `${wins}-${losses}` },
            { label: 'Total P/L', value: `${totalPL >= 0 ? '+' : ''}${totalPL.toFixed(1)}u`, color: totalPL >= 0 ? 'text-green-400' : 'text-[#b01c1c]' },
            { label: 'Total Picks', value: picks.length.toString() },
          ].map((s) => (
            <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.color ?? 'text-white'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Add New Pick */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 mb-10">
          <h2 className="text-lg font-black uppercase tracking-wide mb-6">
            Add New <span className="text-[#b01c1c]">Pick</span>
          </h2>
          <form onSubmit={handleSubmitPick} className="grid md:grid-cols-2 gap-4">
            {/* Event Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Event Name *
              </label>
              <input
                name="event_name"
                value={form.event_name}
                onChange={handleFormChange}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-[#b01c1c] transition-colors"
                placeholder="e.g. UFC 310"
              />
            </div>

            {/* Fight Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Fight Date *
              </label>
              <input
                type="date"
                name="fight_date"
                value={form.fight_date}
                onChange={handleFormChange}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-[#b01c1c] transition-colors"
              />
            </div>

            {/* Tier */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Tier *
              </label>
              <select
                name="tier"
                value={form.tier}
                onChange={handleFormChange}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-[#b01c1c] transition-colors cursor-pointer"
              >
                <option value="FREE">FREE</option>
                <option value="INNER_CIRCLE">Inner Circle</option>
              </select>
            </div>

            {/* Fighter A */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Fighter A *
              </label>
              <input
                name="fighter_a"
                value={form.fighter_a}
                onChange={handleFormChange}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-[#b01c1c] transition-colors"
                placeholder="e.g. Jon Jones"
              />
            </div>

            {/* Fighter B */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Fighter B *
              </label>
              <input
                name="fighter_b"
                value={form.fighter_b}
                onChange={handleFormChange}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-[#b01c1c] transition-colors"
                placeholder="e.g. Stipe Miocic"
              />
            </div>

            {/* Pick */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Pick *
              </label>
              <input
                name="pick"
                value={form.pick}
                onChange={handleFormChange}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-[#b01c1c] transition-colors"
                placeholder="e.g. Jon Jones ML"
              />
            </div>

            {/* Odds */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Odds * (American: +150, -200)
              </label>
              <input
                name="odds"
                value={form.odds}
                onChange={handleFormChange}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-[#b01c1c] transition-colors"
                placeholder="-150"
              />
            </div>

            {/* Units */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Units *
              </label>
              <input
                name="units"
                type="number"
                step="0.5"
                min="0.5"
                value={form.units}
                onChange={handleFormChange}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-[#b01c1c] transition-colors"
                placeholder="1"
              />
            </div>

            {/* Is Live */}
            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                name="is_live"
                id="is_live_new"
                checked={form.is_live}
                onChange={handleFormChange}
                className="w-4 h-4 accent-[#b01c1c] cursor-pointer"
              />
              <label htmlFor="is_live_new" className="text-sm text-gray-300 cursor-pointer">
                Publish immediately (is_live)
              </label>
            </div>

            {/* Analysis */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Analysis
              </label>
              <textarea
                name="analysis"
                value={form.analysis}
                onChange={handleFormChange}
                rows={4}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-[#b01c1c] transition-colors resize-none"
                placeholder="Write your pick analysis here..."
              />
            </div>

            {formError && (
              <div className="md:col-span-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded text-[#b01c1c] text-sm">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="md:col-span-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
                {formSuccess}
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-[#b01c1c] text-white font-black uppercase tracking-widest text-sm rounded hover:bg-[#8b1010] transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding...' : 'Add Pick'}
              </button>
            </div>
          </form>
        </div>

        {/* Picks Management Table */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wide">
              All <span className="text-[#b01c1c]">Picks</span>
            </h2>
            <button
              onClick={loadPicks}
              className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer font-semibold uppercase tracking-widest"
            >
              Refresh
            </button>
          </div>

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
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Result</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-gray-500">P/L</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Live</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingPicks
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-[#111] animate-pulse">
                        {Array.from({ length: 11 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-3 bg-[#1a1a1a] rounded w-12" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : picks.map((pick) => (
                      <tr key={pick.id} className="border-b border-[#111] hover:bg-[#0f0f0f] transition-colors duration-150">
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(pick.fight_date)}</td>
                        <td className="px-4 py-3 text-gray-300 max-w-[100px] truncate whitespace-nowrap">{pick.event_name}</td>
                        <td className="px-4 py-3 text-gray-300 whitespace-nowrap text-xs">
                          {pick.fighter_a} vs {pick.fighter_b}
                        </td>
                        <td className="px-4 py-3 text-white font-bold">{pick.pick}</td>
                        <td className="px-4 py-3 text-gray-300">{pick.odds}</td>
                        <td className="px-4 py-3 text-gray-300">{pick.units}u</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${
                            pick.tier === 'INNER_CIRCLE'
                              ? 'bg-[#b01c1c]/20 text-[#b01c1c] border border-[#b01c1c]/30'
                              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {pick.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${resultBadge[pick.result] ?? ''}`}>
                            {pick.result}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {pick.result !== 'PENDING' ? (
                            <span className={pick.profit_loss >= 0 ? 'text-green-400' : 'text-[#b01c1c]'}>
                              {pick.profit_loss >= 0 ? '+' : ''}{pick.profit_loss.toFixed(2)}u
                            </span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleLive(pick)}
                            className={`w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer relative flex-shrink-0 ${
                              pick.is_live ? 'bg-[#b01c1c]' : 'bg-[#2a2a2a]'
                            }`}
                            aria-label={`Toggle live for ${pick.pick}`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                                pick.is_live ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {pick.result === 'PENDING' && (
                            <div className="flex gap-1">
                              {(['WIN', 'LOSS', 'PUSH'] as const).map((r) => (
                                <button
                                  key={r}
                                  onClick={() => handleUpdateResult(pick, r)}
                                  className={`px-2 py-0.5 text-xs font-bold uppercase rounded cursor-pointer transition-opacity duration-150 hover:opacity-80 ${
                                    r === 'WIN'
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                      : r === 'LOSS'
                                      ? 'bg-red-500/20 text-[#b01c1c] border border-red-500/30'
                                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                  }`}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
              {!loadingPicks && picks.length > 0 && (
                <tfoot>
                  <tr className="bg-[#050505] border-t border-[#2a2a2a]">
                    <td colSpan={8} className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500">
                      Totals — {wins}W {losses}L
                    </td>
                    <td className={`px-4 py-3 text-right font-black ${totalPL >= 0 ? 'text-green-400' : 'text-[#b01c1c]'}`}>
                      {totalPL >= 0 ? '+' : ''}{totalPL.toFixed(2)}u
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>

            {!loadingPicks && picks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No picks yet. Add one above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
