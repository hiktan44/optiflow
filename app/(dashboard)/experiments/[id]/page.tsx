import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Badge, StatusDot } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ResultsChart } from '@/components/experiments/ResultsChart'
import { computeBayesianResults } from '@/lib/bayesian/stats'
import { formatDate, formatPercent } from '@/lib/utils'
import { Play, Square, Edit } from 'lucide-react'
import type { Experiment, Variation, Goal, Event } from '@/lib/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return { title: `Experiment ${id.slice(0, 8)}` }
}

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: experiment } = await supabase
    .from('experiments')
    .select('*')
    .eq('id', id)
    .single()

  if (!experiment) notFound()

  const exp = experiment as Experiment

  const [{ data: variations }, { data: goals }, { data: events }] =
    await Promise.all([
      supabase
        .from('variations')
        .select('*')
        .eq('experiment_id', id)
        .order('index'),
      supabase.from('goals').select('*').eq('experiment_id', id),
      supabase
        .from('events')
        .select('variation_id, event_type, goal_id')
        .eq('experiment_id', id),
    ])

  const vars = (variations ?? []) as Variation[]
  const primaryGoal = ((goals ?? []) as Goal[]).find((g) => g.is_primary)
  const evts = (events ?? []) as Pick<Event, 'variation_id' | 'event_type' | 'goal_id'>[]

  // Compute Bayesian results
  const varStats = vars.map((v) => {
    const assignments = evts.filter(
      (e) => e.variation_id === v.id && e.event_type === 'assignment'
    ).length
    const conversions = evts.filter(
      (e) =>
        e.variation_id === v.id &&
        e.event_type === 'conversion' &&
        (!primaryGoal || e.goal_id === primaryGoal.id)
    ).length
    return { id: v.id, name: v.name, visitors: assignments, conversions }
  })

  const control = varStats[0] ?? { visitors: 0, conversions: 0 }
  const bayesianResults = varStats.map((vs, i) => {
    if (i === 0) {
      return {
        id: vs.id,
        name: vs.name,
        visitors: vs.visitors,
        conversions: vs.conversions,
        conversion_rate: vs.visitors > 0 ? vs.conversions / vs.visitors : 0,
        chance_to_beat_baseline: null,
        expected_improvement: null,
        credible_interval: [0, 1] as [number, number],
      }
    }
    const results = computeBayesianResults(control, vs)
    return {
      id: vs.id,
      name: vs.name,
      visitors: vs.visitors,
      conversions: vs.conversions,
      conversion_rate: results.variation.conversion_rate,
      chance_to_beat_baseline: results.variation.chance_to_beat_baseline,
      expected_improvement: results.variation.expected_improvement,
      credible_interval: results.variation.credible_interval,
    }
  })

  const totalVisitors = varStats.reduce((sum, v) => sum + v.visitors, 0)
  const primaryCvr = bayesianResults[1]?.conversion_rate ?? 0

  return (
    <>
      <Header
        breadcrumb={[
          { label: 'Experiments', href: '/experiments' },
          { label: exp.name },
        ]}
      />
      <div className="p-6 space-y-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {exp.name}
              </h1>
              <Badge variant={exp.status}>
                <StatusDot status={exp.status} />
                <span className="capitalize">{exp.status}</span>
              </Badge>
            </div>
            {exp.description && (
              <p className="text-sm text-[#64748B]">{exp.description}</p>
            )}
            <p className="text-xs text-[#94A3B8] mt-1">
              Created {formatDate(exp.created_at)}
              {exp.started_at && ` · Started ${formatDate(exp.started_at)}`}
              {exp.ended_at && ` · Ended ${formatDate(exp.ended_at)}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {exp.status === 'draft' && (
              <form action={`/api/experiments/${id}/start`} method="POST">
                <Button type="submit" size="sm">
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  Start test
                </Button>
              </form>
            )}
            {exp.status === 'running' && (
              <form action={`/api/experiments/${id}/stop`} method="POST">
                <Button type="submit" variant="outline" size="sm">
                  <Square className="h-3.5 w-3.5" aria-hidden="true" />
                  Stop test
                </Button>
              </form>
            )}
            {(exp.status === 'draft' || exp.status === 'paused') && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/experiments/${id}/edit`}>
                  <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            title="Total Visitors"
            value={totalVisitors.toLocaleString()}
            description="Assigned to experiment"
          />
          <MetricCard
            title="Primary CVR (Variation A)"
            value={formatPercent(primaryCvr)}
            trend={
              bayesianResults[1]?.chance_to_beat_baseline
                ? {
                    value: `${formatPercent(bayesianResults[1].chance_to_beat_baseline)} chance to win`,
                    direction: bayesianResults[1].chance_to_beat_baseline >= 0.95 ? 'up' : 'neutral',
                  }
                : undefined
            }
          />
          <MetricCard
            title="Traffic Split"
            value={`${100 - exp.traffic_split}/${exp.traffic_split}`}
            description="Control / Variation A"
          />
        </div>

        {/* Results chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bayesian Results</CardTitle>
          </CardHeader>
          {bayesianResults.length >= 2 ? (
            <ResultsChart variations={bayesianResults} />
          ) : (
            <p className="py-8 text-center text-sm text-[#64748B]">
              Waiting for enough data to compute results…
            </p>
          )}
        </Card>

        {/* Variations */}
        <Card>
          <CardHeader>
            <CardTitle>Variations ({vars.length})</CardTitle>
          </CardHeader>
          {vars.length === 0 ? (
            <p className="text-sm text-[#64748B]">No variations configured.</p>
          ) : (
            <ul className="space-y-3" role="list">
              {vars.map((v) => (
                <li
                  key={v.id}
                  className="rounded-lg border border-[#E2E8F0] dark:border-[#334155] p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]">
                      {v.name}
                    </span>
                    <Badge variant={v.index === 0 ? 'default' : 'info'}>
                      {v.index === 0 ? 'Control' : `Variation ${v.index}`}
                    </Badge>
                  </div>
                  {v.changes.length > 0 ? (
                    <pre className="text-xs text-[#64748B] overflow-auto rounded bg-[#F8FAFC] dark:bg-[#273449] p-2 max-h-32">
                      {JSON.stringify(v.changes, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-[#94A3B8]">No DOM changes (baseline)</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
