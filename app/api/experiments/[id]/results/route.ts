import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeBayesianResults } from '@/lib/bayesian/stats'
import type { Variation, Goal, Event } from '@/lib/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: experiment } = await supabase
    .from('experiments')
    .select('*, projects!inner(user_id)')
    .eq('id', id)
    .eq('projects.user_id', user.id)
    .single()

  if (!experiment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [{ data: variations }, { data: goals }, { data: events }] = await Promise.all([
    supabase.from('variations').select('*').eq('experiment_id', id).order('index'),
    supabase.from('goals').select('*').eq('experiment_id', id),
    supabase
      .from('events')
      .select('variation_id, event_type, goal_id')
      .eq('experiment_id', id),
  ])

  const vars = (variations ?? []) as Variation[]
  const primaryGoal = ((goals ?? []) as Goal[]).find((g) => g.is_primary)
  const evts = (events ?? []) as Pick<Event, 'variation_id' | 'event_type' | 'goal_id'>[]

  const varStats = vars.map((v) => ({
    id: v.id,
    name: v.name,
    visitors: evts.filter((e) => e.variation_id === v.id && e.event_type === 'assignment').length,
    conversions: evts.filter(
      (e) =>
        e.variation_id === v.id &&
        e.event_type === 'conversion' &&
        (!primaryGoal || e.goal_id === primaryGoal.id)
    ).length,
  }))

  const control = varStats[0] ?? { visitors: 0, conversions: 0 }

  const results = varStats.map((vs, i) => {
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
    const bayesian = computeBayesianResults(control, vs)
    return {
      id: vs.id,
      name: vs.name,
      visitors: vs.visitors,
      conversions: vs.conversions,
      conversion_rate: bayesian.variation.conversion_rate,
      chance_to_beat_baseline: bayesian.variation.chance_to_beat_baseline,
      expected_improvement: bayesian.variation.expected_improvement,
      credible_interval: bayesian.variation.credible_interval,
    }
  })

  return NextResponse.json({
    experiment_id: id,
    status: experiment.status,
    total_visitors: varStats.reduce((s, v) => s + v.visitors, 0),
    variations: results,
  })
}
