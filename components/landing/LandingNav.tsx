import Link from 'next/link'
import { Zap } from 'lucide-react'

export function LandingNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="OptiFlow home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5]">
            <Zap className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-white">OptiFlow</span>
        </Link>

        {/* Nav links */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {[
            { href: '#features', label: 'Features' },
            { href: '#how-it-works', label: 'How it works' },
            { href: '#pricing', label: 'Pricing' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#94A3B8] transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  )
}
