import Link from 'next/link'
import { Zap } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="bg-[#0F172A] border-t border-[#1E293B] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="OptiFlow home">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5]">
                <Zap className="h-3.5 w-3.5 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-white">OptiFlow</span>
            </Link>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Visual A/B testing for growth teams. No developers required.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">
              Product
            </h3>
            <ul className="space-y-2" role="list">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Chrome Extension', href: '#' },
                { label: 'Changelog', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">
              Company
            </h3>
            <ul className="space-y-2" role="list">
              {[
                { label: 'About', href: '#' },
                { label: 'Blog', href: '#' },
                { label: 'Careers', href: '#' },
                { label: 'Contact', href: 'mailto:hello@optiflow.io' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">
              Legal
            </h3>
            <ul className="space-y-2" role="list">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy', href: '/cookies' },
                { label: 'GDPR', href: '/gdpr' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1E293B] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748B]">
            © 2026 OptiFlow. All rights reserved.
          </p>
          <p className="text-xs text-[#64748B]">
            Built on top of{' '}
            <a
              href="https://www.growthbook.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4F46E5] hover:underline"
            >
              GrowthBook
            </a>{' '}
            · Powered by Supabase & Cloudflare
          </p>
        </div>
      </div>
    </footer>
  )
}
