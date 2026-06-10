import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Card } from '@/components/ui/Card'
import { Badge, StatusDot } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Experiment } from '@/lib/types'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user!.id)

  const projectIds = projects?.map((p) => p.id) ?? []

  const { data: experiments } = await supabase
    .from('experiments')
    .select('*')
    .in('project_id', projectIds.length ? projectIds : [''])
    .order('created_at', { ascending: false })
    .limit(5)

  const allExps = (experiments ?? []) as Experiment[]
  const running = allExps.filter((e) => e.status === 'running')
  const completed = allExps.filter((e) => e.status === 'completed')

  return (
    <>
      <Header breadcrumb={[{ label: 'Dashboard' }]} />
      <div className="p-6 space-y-6">
        {/* KPI row */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Experiments"
            value={allExps.length}
            description="All time"
          />
          <MetricCard
            title="Active Tests"
            value={running.length}
            trend={{ value: 'Currently running', direction: 'neutral' }}
          />
          <MetricCard
            title="Completed Tests"
            value={completed.length}
            trend={{ value: 'Results available', direction: 'up' }}
          />
          <MetricCard
            title="Projects"
            value={projectIds.length}
            description="Connected sites"
          />
        </div>

        {/* Recent experiments */}
        <Card padding="none">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155]">
            <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              Recent Experiments
            </h2>
            <Button asChild size="sm">
              <Link href="/experiments/new">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                New test
              </Link>
            </Button>
          </div>

          {allExps.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#64748B]">No experiments yet.</p>
              <Button asChild className="mt-4">
                <Link href="/experiments/new">Create your first test</Link>
              </Button>
            </div>
          ) : (
            <ul role="list">
              {allExps.map((exp) => (
                <li
                  key={exp.id}
                  className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] last:border-0 hover:bg-[#F8FAFC] dark:hover:bg-[#273449] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <StatusDot status={exp.status} />
                    <div>
                      <Link
                        href={`/experiments/${exp.id}`}
                        className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] hover:text-[#4F46E5] transition-colors"
                      >
                        {exp.name}
                      </Link>
                      <p className="text-xs text-[#64748B]">
                        {formatDate(exp.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={exp.status} className="capitalize">
                    {exp.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
