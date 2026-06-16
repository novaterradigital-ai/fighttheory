import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import StatsBar from '@/components/StatsBar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      <section className="w-full pt-16">
        {/* Image container — fixed height on desktop only */}
        <div className="relative w-full overflow-hidden h-[56vw] md:h-[70vh]">
          <Image
            src="/hero2.png"
            alt="Fight Theory — Calculated Picks. Real Fight Analysis."
            width={1920}
            height={640}
            className="w-full h-full object-cover md:absolute md:inset-0 md:h-full md:w-full md:object-cover"
            style={{objectPosition: 'center 70%'}}
            priority
          />
          {/* AI badge — top of hero */}
          <div className="absolute top-2 left-0 right-0 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#b01c1c]/50 rounded-full bg-black/60 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b01c1c] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#b01c1c]">AI Powered Fight Analysis</span>
            </div>
          </div>
          {/* Bottom fade — desktop only */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
          {/* Overlaid CTA — desktop only */}
          <div className="hidden md:flex absolute bottom-8 left-0 right-0 px-4 flex-row gap-3 justify-center items-center max-w-lg mx-auto">
            <Link
              href="/picks"
              className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded hover:bg-gray-200 transition-colors duration-200 text-center"
            >
              View Public Picks
            </Link>
            <Link
              href="/inner-circle"
              className="flex-1 py-4 bg-[#b01c1c] text-white font-black uppercase tracking-widest text-sm rounded hover:bg-[#8b1010] transition-colors duration-200 text-center"
            >
              Join Inner Circle
            </Link>
          </div>
        </div>
        {/* CTA buttons — mobile only, below image */}
        <div className="md:hidden bg-black px-4 pt-4 pb-8 flex flex-col gap-3 max-w-lg mx-auto">
          <Link
            href="/picks"
            className="py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded hover:bg-gray-200 transition-colors duration-200 text-center"
          >
            View Public Picks
          </Link>
          <Link
            href="/inner-circle"
            className="py-4 bg-[#b01c1c] text-white font-black uppercase tracking-widest text-sm rounded hover:bg-[#8b1010] transition-colors duration-200 text-center"
          >
            Join Inner Circle
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 px-4 border-y border-[#1a1a1a] bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-600 mb-6">
            Verified Record — No Cherry Picking
          </p>
          <StatsBar />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-center mb-1">
            The <span className="text-[#b01c1c]">Process</span>
          </h2>
          <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-8">How we find the edge</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                title: 'Data First',
                desc: 'Fighter metrics, stylistic tendencies, recent form, and line movement — all weighted before a single opinion enters the room.',
              },
              {
                step: '02',
                title: 'Build the Theory',
                desc: 'Every pick has a reason. We map how the fight plays out, where the edge lives, and whether the line reflects what we see.',
              },
              {
                step: '03',
                title: 'Adapt or Pass',
                desc: "If the line moves against us or new info surfaces, we adapt. No ego. No chasing. Discipline is the edge most bettors don't have.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 flex flex-col gap-3"
              >
                <span className="text-3xl font-black text-[#b01c1c]/40">{item.step}</span>
                <h3 className="text-base font-black uppercase tracking-wide text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Tiers */}
      <section className="py-12 md:py-16 px-4 bg-[#050505] border-y border-[#1a1a1a]">
        <div className="max-w-lg md:max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-center mb-1">
            Choose Your <span className="text-[#b01c1c]">Access</span>
          </h2>
          <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-8">The record is public. The edge is not.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Public */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide text-white mb-1">Public</h3>
                <p className="text-3xl font-black text-white">$0</p>
                <p className="text-gray-500 text-sm">No account needed</p>
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  'Selected public picks',
                  'Full verified record',
                  'Performance stats',
                  'Fight card breakdowns',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/picks"
                className="mt-auto block text-center px-6 py-3 border border-[#2a2a2a] text-gray-300 font-bold uppercase tracking-widest text-sm rounded hover:border-[#444] hover:text-white transition-colors duration-200"
              >
                View Public Picks
              </Link>
            </div>

            {/* Inner Circle */}
            <div className="bg-[#0a0a0a] border border-[#b01c1c]/50 rounded-lg p-6 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#b01c1c] text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-bl">
                Welcome Offer
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide text-[#b01c1c] mb-1">Inner Circle</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-base text-gray-600 line-through">$98</p>
                  <p className="text-3xl font-black text-white">$68<span className="text-base text-gray-500 font-semibold">/mo</span></p>
                </div>
                <p className="text-gray-500 text-xs mt-1">$68 first month · Then $98/mo · Cancel anytime</p>
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  'Every pick we make',
                  'Full written analysis on each fight',
                  'Early access before lines move',
                  'Unit sizing on every play',
                  'Private Discord access',
                  'Direct line to the analyst',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#b01c1c] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/inner-circle"
                className="mt-auto block text-center px-6 py-3 bg-[#b01c1c] text-white font-black uppercase tracking-widest text-sm rounded hover:bg-[#8b1010] transition-colors duration-200"
              >
                Join Inner Circle
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-10 px-4 bg-[#050505]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Image src="/logo.png" alt="Fight Theory" width={100} height={32} className="h-8 w-auto object-contain" />
          <p className="text-gray-600 text-xs text-center max-w-md leading-relaxed">
            Fight Theory is for entertainment purposes only. Past results do not guarantee future performance.
            Bet responsibly. Never wager more than you can afford to lose.
          </p>
          <p className="text-gray-700 text-xs">&copy; {new Date().getFullYear()} Fight Theory</p>
        </div>
      </footer>
    </div>
  )
}
