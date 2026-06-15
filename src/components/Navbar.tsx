'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/record', label: 'Record' },
    { href: '/picks', label: 'Picks' },
    { href: '/inner-circle', label: 'Inner Circle' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <Image
            src="/logo.png"
            alt="Fight Theory"
            width={160}
            height={44}
            className="h-9 md:h-11 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${
                pathname === link.href
                  ? 'text-[#b01c1c]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/inner-circle"
            className="px-5 py-2 bg-[#b01c1c] text-white text-sm font-bold uppercase tracking-widest rounded hover:bg-[#8b1010] transition-colors duration-200 cursor-pointer"
          >
            Join Inner Circle
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-200 ${
              menuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-200 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-200 ${
              menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#1a1a1a] px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-semibold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${
                pathname === link.href
                  ? 'text-[#b01c1c]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/inner-circle"
            onClick={() => setMenuOpen(false)}
            className="inline-block px-5 py-2 bg-[#b01c1c] text-white text-sm font-bold uppercase tracking-widest rounded hover:bg-[#8b1010] transition-colors duration-200 text-center cursor-pointer"
          >
            Join Inner Circle
          </Link>
        </div>
      )}
    </nav>
  )
}
