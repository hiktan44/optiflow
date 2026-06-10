import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

async function getAuthorizedExperiment(supabase: Awaited<ReturnType<typeof createClient>>, id: string, userId: string) {
  const { data } = await supabase
    .from('experiments')
    .select('*, projects!inner(user_id)')
    .eq('id', id)
    .eq('projects.user_id', userId)
    .single()
  return data
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const exp = await getAuthorizedExperiment(supabase, id, user.id)
  if (!exp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [{ data: variations }, { data: goals }] = await Promise.all([
    supabase.from('variations').select('*').eq('experiment_id', id).order('index'),
    supabase.from('goals').select('*').eq('experiment_id', id),
  ])

  return NextResponse.json({ experiment: exp, variations: variations ?? [], goals: goals ?? [] })
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const exp = await getAuthorizedExperiment(supabase, id, user.id)
  if (!exp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (exp.status === 'running') {
    return NextResponse.json({ error: 'Cannot edit a running experiment' }, { status: 409 })
  }

  const body = await request.json().catch(() => ({}))
  const allowedFields = ['name', 'description', 'target_url', 'traffic_split', 'targeting']
  const updates = Object.fromEntries(
    Object.entries(body as Record<string, unknown>).filter(([k]) => allowedFields.includes(k))
  )

  const { data: updated, error } = await supabase
    .from('experiments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ experiment: updated })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const exp = await getAuthorizedExperiment(supabase, id, user.id)
  if (!exp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (exp.status === 'running') {
    return NextResponse.json({ error: 'Cannot delete a running experiment' }, { status: 409 })
  }

  const { error } = await supabase.from('experiments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
