'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { CreateExperimentInput } from '@/lib/types'

const deleteSchema = z.object({ id: z.string().uuid() })

export async function createExperiment(data: CreateExperimentInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { project_id, variations, goals, ...expData } = data

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single()
  if (!project) throw new Error('Project not found or access denied')

  // Enforce free tier limit
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
    if ((count ?? 0) >= 1) throw new Error('Free plan allows only 1 active experiment')
  }

  const { data: experiment, error } = await supabase
    .from('experiments')
    .insert({ project_id, ...expData })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await supabase.from('variations').insert(
    variations.map((v) => ({ ...v, experiment_id: experiment.id }))
  )

  if (goals.length > 0) {
    await supabase.from('goals').insert(
      goals.map((g) => ({ ...g, experiment_id: experiment.id }))
    )
  }

  revalidatePath('/experiments')
  return experiment
}

export async function updateExperiment(id: string, data: Partial<CreateExperimentInput>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const allowedFields = ['name', 'description', 'target_url', 'traffic_split', 'targeting']
  const updates = Object.fromEntries(
    Object.entries(data as Record<string, unknown>).filter(([k]) => allowedFields.includes(k))
  )

  const { error } = await supabase
    .from('experiments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/experiments')
  revalidatePath(`/experiments/${id}`)
}

export async function deleteExperiment(formData: FormData) {
  const parsed = deleteSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) throw new Error('Invalid experiment ID')

  const { id } = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('experiments')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/experiments')
  redirect('/experiments')
}
