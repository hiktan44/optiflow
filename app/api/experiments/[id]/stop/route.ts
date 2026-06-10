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

  if (experiment.status !== 'running') {
    return NextResponse.json({ error: 'Experiment is not running' }, { status: 409 })
  }

  const { data: updated, error } = await supabase
    .from('experiments')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ experiment: updated })
}
