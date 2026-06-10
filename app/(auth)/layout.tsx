import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col">
      <header className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] rounded-lg"
          aria-label="Go to OptiFlow home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5]">
            <Zap className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            OptiFlow
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="p-6 text-center">
        <p className="text-xs text-[#64748B]">
          © 2026 OptiFlow ·{' '}
          <Link href="/privacy" className="hover:text-[#4F46E5] transition-colors">
            Privacy
          </Link>{' '}
          ·{' '}
          <Link href="/terms" className="hover:text-[#4F46E5] transition-colors">
            Terms
          </Link>
        </p>
      </footer>
    </div>
  )
}
