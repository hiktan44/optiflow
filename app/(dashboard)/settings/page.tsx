import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { BillingSection } from '@/components/settings/BillingSection'
import type { Profile, Subscription } from '@/lib/types'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user!.id).single(),
  ])

  const p = profile as Profile | null
  const sub = subscription as Subscription | null

  return (
    <>
      <Header breadcrumb={[{ label: 'Settings' }]} />
      <div className="p-6 max-w-2xl space-y-6">
        <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
          Settings
        </h1>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-sm text-[#64748B]">Email</span>
              <span className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]">
                {user?.email}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-sm text-[#64748B]">Plan</span>
              <Badge
                variant={
                  p?.plan === 'pro' ? 'info' : p?.plan === 'enterprise' ? 'success' : 'default'
                }
                className="capitalize"
              >
                {p?.plan ?? 'free'}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">MTU Limit</span>
              <span className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] font-tabular">
                {(p?.mtu_limit ?? 2500).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Billing */}
        <BillingSection profile={p} subscription={sub} />
      </div>
    </>
  )
}
