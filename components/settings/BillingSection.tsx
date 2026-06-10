'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Profile, Subscription } from '@/lib/types'
import { ExternalLink } from 'lucide-react'

interface BillingSectionProps {
  profile: Profile | null
  subscription: Subscription | null
}

export function BillingSection({ profile, subscription }: BillingSectionProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async (plan: 'pro' | 'enterprise') => {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error ?? 'Failed to create checkout')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error ?? 'Failed to open portal')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const currentPlan = profile?.plan ?? 'free'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Plan</CardTitle>
        <CardDescription>Manage your subscription</CardDescription>
      </CardHeader>

      {/* Current plan */}
      <div className="rounded-lg border border-[#E2E8F0] dark:border-[#334155] p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] capitalize">
              {currentPlan} Plan
            </p>
            {subscription?.current_period_end && (
              <p className="text-xs text-[#64748B]">
                Renews {formatDate(subscription.current_period_end)}
              </p>
            )}
          </div>
          <Badge
            variant={subscription?.status === 'active' ? 'success' : 'warning'}
            className="capitalize"
          >
            {subscription?.status ?? 'active'}
          </Badge>
        </div>
      </div>

      {/* Plan upgrade options */}
      {currentPlan === 'free' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-[#4F46E5]/30 bg-[#EEF2FF] p-4 dark:bg-[#1E293B]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                  Upgrade to Pro
                </p>
                <p className="text-xs text-[#64748B]">
                  Unlimited tests · 50K MTU · $59/mo
                </p>
              </div>
              <Button size="sm" loading={loading} onClick={() => handleUpgrade('pro')}>
                Upgrade
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-[#E2E8F0] dark:border-[#334155] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                  Enterprise
                </p>
                <p className="text-xs text-[#64748B]">
                  Custom limits · SSO · $299+/mo
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                loading={loading}
                onClick={() => handleUpgrade('enterprise')}
              >
                Contact sales
              </Button>
            </div>
          </div>
        </div>
      )}

      {currentPlan !== 'free' && (
        <Button
          variant="outline"
          className="w-full"
          loading={loading}
          onClick={handleManageBilling}
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Manage subscription
        </Button>
      )}
    </Card>
  )
}
