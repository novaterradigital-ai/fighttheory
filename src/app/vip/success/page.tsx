import Link from 'next/link'

export default function VipSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-5xl">🥊</div>
      <h1 className="text-3xl font-bold">You&apos;re now a Inner Circle member!</h1>
      <p className="text-lg text-gray-400 max-w-md">
        Welcome to Fight Theory. You now have full access to all Inner Circle picks and analysis. Let&apos;s
        get to work.
      </p>
      <Link
        href="/"
        className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
      >
        Go to Picks
      </Link>
    </main>
  )
}
