import Link from 'next/link'
import type { Metadata } from 'next'
import { Card } from '@/components/ui/Card'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function LoginPage() {
  return (
    <Card>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Sign in to your OptiFlow account
        </p>
      </div>

      <AuthForm mode="login" />

      <div className="mt-4 text-center">
        <p className="text-sm text-[#64748B]">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-[#4F46E5] hover:underline"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </Card>
  )
}
