import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ExperimentStatus } from '@/lib/types'

const createSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  target_url: z.string().url(),
  traffic_split: z.number().int().min(1).max(99).default(50),
  targeting: z.record(z.unknown()).default({}),
  variations: z
    .array(
      z.object({
        name: z.string(),
        index: z.number().int().min(0),
        changes: z.array(z.record(z.unknown())).default([]),
      })
    )
    .min(2, 'At least 2 variations required'),
  goals: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['click', 'pageview', 'custom']),
      selector: z.string().optional(),
      url_pattern: z.string().optional(),
      is_primary: z.boolean().default(false),
    })
  ),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')
  const status = searchParams.get('status') as ExperimentStatus | null

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  let query = supabase
    .from('experiments')
    .select('*, variations(count)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: experiments, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ experiments: experiments ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { project_id, variations, goals, ...expData } = parsed.data

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 })
  }

  // Check free tier limit (max 1 active experiment)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'free') {
    const { count } = await supabase
      .from('experiments')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', project_id)
      .eq('status', 'running')

    if ((count ?? 0) >= 1) {
      return NextResponse.json(
        { error: 'Free plan allows only 1 active experiment' },
        { status: 403 }
      )
    }
  }

  // Validate control variation exists
  if (!variations.some((v) => v.index === 0)) {
    return NextResponse.json(
      { error: 'At least one variation with index 0 (control) is required' },
      { status: 422 }
    )
  }

  const { data: experiment, error: expError } = await supabase
    .from('experiments')
    .insert({ project_id, ...expData })
    .select()
    .single()

  if (expError) {
    return NextResponse.json({ error: expError.message }, { status: 500 })
  }

  // Insert variations
  await supabase.from('variations').insert(
    variations.map((v) => ({ ...v, experiment_id: experiment.id }))
  )

  // Insert goals
  if (goals.length > 0) {
    await supabase.from('goals').insert(
      goals.map((g) => ({ ...g, experiment_id: experiment.id }))
    )
  }

  return NextResponse.json({ experiment }, { status: 201 })
}
