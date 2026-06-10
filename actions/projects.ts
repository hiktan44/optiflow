'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { isValidDomain } from '@/lib/utils'

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().min(1),
})

export async function createProject(formData: FormData) {
  const parsed = createProjectSchema.safeParse({
    name: formData.get('name'),
    domain: formData.get('domain'),
  })

  if (!parsed.success) throw new Error('Invalid project data')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { name, domain } = parsed.data
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0]

  if (!isValidDomain(cleanDomain)) throw new Error('Invalid domain format')

  const { error } = await supabase
    .from('projects')
    .insert({ user_id: user.id, name, domain: cleanDomain })

  if (error) throw new Error(error.message)

  revalidatePath('/install')
  redirect('/install')
}

export async function verifyProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('projects')
    .update({ is_verified: true, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/install')
}
