import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidDomain } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().min(1),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, experiments(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = (projects ?? []).map((p) => ({
    ...p,
    experiment_count: (p.experiments as unknown as { count: number }[])?.[0]?.count ?? 0,
    experiments: undefined,
  }))

  return NextResponse.json({ projects: result })
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

  const { name, domain } = parsed.data
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0]

  if (!isValidDomain(cleanDomain)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user.id)
    .eq('domain', cleanDomain)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Domain already registered in this account' }, { status: 409 })
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ user_id: user.id, name, domain: cleanDomain })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ project }, { status: 201 })
}
