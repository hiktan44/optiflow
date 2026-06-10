import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

  const [{ count: varCount }, { count: goalCount }] = await Promise.all([
    supabase
      .from('variations')
      .select('id', { count: 'exact', head: true })
      .eq('experiment_id', id),
    supabase
      .from('goals')
      .select('id', { count: 'exact', head: true })
      .eq('experiment_id', id)
      .eq('is_primary', true),
  ])

  if ((varCount ?? 0) < 2) {
    return NextResponse.json({ error: 'At least 2 variations required' }, { status: 400 })
  }

  if ((goalCount ?? 0) < 1) {
    return NextResponse.json({ error: 'At least 1 primary goal required' }, { status: 400 })
  }

  const { data: updated, error } = await supabase
    .from('experiments')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ experiment: updated })
}
