'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

const LAUNCH_PRICE = 68
const REGULAR_PRICE = 98

const features = [
  'Every pick we make — nothing held back',
  'AI-powered breakdown on every fight',
  'Full written analysis on each fight',
  'Early access before lines move',
  'Unit sizing on every play',
  'Private Discord access',
  'Direct line to the analyst',
]

const faqs = [
  {
    q: 'When will I receive picks?',
    a: 'Inner Circle picks are released at least 24–48 hours before each event, often sooner. You\'ll receive a notification via email and Discord when new picks drop.',
  },
  {
    q: 'How many picks per month?',
    a: 'Volume varies based on the fight calendar, but Inner Circle members typically receive 8–15 picks per month across UFC, Bellator, and boxing events.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel your subscription at any time from your account dashboard. You\'ll retain access until the end of your current billing period.',
  },
  {
    q: 'What sports do you cover?',
    a: 'We primarily focus on UFC/MMA, with select boxing and kickboxing picks when strong edges are identified.',
  },
  {
    q: 'Is my payment secure?',
    a: 'All payments are processed securely through Stripe. We never store your card information.',
  },
  {
    q: 'Do you guarantee profits?',
    a: 'No. No legitimate pick service can guarantee profits. We maintain a verified, transparent record and provide sharp analysis — but betting always involves risk.',
  },
]

export default function VIPPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Failed to start checkout. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        {/* Launch banner */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-[#b01c1c]/10 border border-[#b01c1c]/40 rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-[#b01c1c] animate-pulse flex-shrink-0" />
            <p className="text-sm text-gray-300 leading-snug">
              <span className="text-white font-bold">Welcome offer.</span>{' '}
              First month is ${LAUNCH_PRICE}, then ${REGULAR_PRICE}/mo after that. Cancel anytime.
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Join <span className="text-[#b01c1c]">Inner Circle</span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
            Full access to every pick, every breakdown, every edge we find. Nothing held back.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-[#0a0a0a] border border-[#b01c1c]/50 rounded-lg overflow-hidden">
            {/* Card Header */}
            <div className="bg-[#b01c1c] px-8 py-5 text-center">
              <p className="text-white/70 font-bold uppercase tracking-widest text-xs mb-2">Inner Circle — Welcome Offer</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-white/40 text-2xl font-bold line-through">${REGULAR_PRICE}</p>
                <p className="text-white text-5xl font-black">
                  ${LAUNCH_PRICE}<span className="text-xl font-semibold opacity-70">/mo</span>
                </p>
              </div>
              <p className="text-white/70 text-xs mt-2">Locked in for life · Cancel anytime</p>
            </div>

            {/* Features */}
            <div className="px-8 py-6">
              <ul className="flex flex-col gap-3 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#b01c1c] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded text-[#b01c1c] text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 bg-[#b01c1c] text-white font-black uppercase tracking-widest text-sm rounded hover:bg-[#8b1010] transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Redirecting...
                  </>
                ) : (
                  `Join Inner Circle — $${LAUNCH_PRICE}/mo`
                )}
              </button>

              <p className="text-center text-gray-600 text-xs mt-3">
                Secured by Stripe. Cancel anytime from your account.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-center">
            Frequently Asked <span className="text-[#b01c1c]">Questions</span>
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-[#0f0f0f] transition-colors duration-150"
                >
                  <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="border-t border-[#1a1a1a] py-6 px-4 text-center">
        <p className="text-gray-700 text-xs max-w-lg mx-auto">
          Fight Theory is for entertainment purposes only. We do not guarantee profits. Gambling involves risk. Please bet responsibly.
        </p>
      </div>
    </div>
  )
}
