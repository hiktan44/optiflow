import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { ExperimentCard } from '@/components/experiments/ExperimentCard'
import type { Experiment } from '@/lib/types'

export const metadata: Metadata = { title: 'Experiments' }

export default async function ExperimentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user!.id)

  const projectIds = projects?.map((p) => p.id) ?? []

  const { data: experiments } = await supabase
    .from('experiments')
    .select('*')
    .in('project_id', projectIds.length ? projectIds : [''])
    .order('created_at', { ascending: false })

  const exps = (experiments ?? []) as Experiment[]

  return (
    <>
      <Header
        breadcrumb={[{ label: 'Experiments' }]}
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Experiments
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              {exps.length} experiment{exps.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button asChild>
            <Link href="/experiments/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New experiment
            </Link>
          </Button>
        </div>

        {exps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E2E8F0] dark:border-[#334155] py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF]">
              <span className="text-2xl" aria-hidden="true">
                🧪
              </span>
            </div>
            <h2 className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              No experiments yet
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Create your first A/B test and start optimizing.
            </p>
            <Button asChild className="mt-4">
              <Link href="/experiments/new">Create experiment</Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="list">
            {exps.map((exp) => (
              <li key={exp.id}>
                <ExperimentCard experiment={exp} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
