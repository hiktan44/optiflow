import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function LandingCTA() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div
          className="rounded-3xl p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #4F46E5 100%)',
            backgroundSize: '200% 200%',
          }}
        >
          {/* Decorative elements */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white opacity-5"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white opacity-5"
          />

          <div className="relative">
            <h2 className="text-4xl font-bold text-white lg:text-5xl">
              Ship your first test today
            </h2>
            <p className="mt-4 text-lg text-indigo-200 max-w-xl mx-auto">
              Join growth teams who run 3× more experiments without touching their
              sprint board. Free forever, no credit card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-[#4F46E5] transition-all hover:bg-indigo-50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#4F46E5]"
              >
                Create free account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-400 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#4F46E5]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
