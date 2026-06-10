import Link from 'next/link'
import type { Metadata } from 'next'
import { Card } from '@/components/ui/Card'
import { AuthForm } from '@/components/auth/AuthForm'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Create Account',
}

const perks = [
  '2,500 monthly tracked users free',
  '1 active experiment — no limits on drafts',
  'Full Bayesian statistics dashboard',
  'Chrome extension included',
]

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            Start experimenting today
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Free forever — no credit card required
          </p>
        </div>

        <AuthForm mode="signup" />

        <div className="mt-4 text-center">
          <p className="text-sm text-[#64748B]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-[#4F46E5] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>

      <ul className="grid grid-cols-2 gap-2" role="list">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2">
            <Check
              className="h-4 w-4 shrink-0 text-[#10B981] mt-0.5"
              aria-hidden="true"
            />
            <span className="text-xs text-[#64748B]">{perk}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
