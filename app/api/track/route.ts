import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const trackSchema = z.object({
  snippet_key: z.string(),
  visitor_id: z.string(),
  session_id: z.string(),
  event_type: z.enum(['assignment', 'conversion', 'pageview']),
  experiment_id: z.string().uuid().optional(),
  variation_id: z.string().uuid().optional(),
  goal_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).default({}),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = trackSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { snippet_key, ...eventData } = parsed.data

  const supabase = await createServiceClient()
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('snippet_key', snippet_key)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Invalid snippet key' }, { status: 404 })
  }

  const { error } = await supabase.from('events').insert({
    project_id: project.id,
    ...eventData,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }

  return NextResponse.json({ accepted: true }, { status: 202 })
}
