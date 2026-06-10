import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ExperimentForm } from '@/components/experiments/ExperimentForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const metadata: Metadata = { title: 'New Experiment' }

export default async function NewExperimentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, domain')
    .eq('user_id', user!.id)
    .limit(1)

  if (!projects || projects.length === 0) {
    redirect('/install')
  }

  const defaultProjectId = projects[0].id

  return (
    <>
      <Header
        breadcrumb={[
          { label: 'Experiments', href: '/experiments' },
          { label: 'New Experiment' },
        ]}
      />
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/experiments">← Back</Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Create Experiment
            </h1>
            <p className="text-sm text-[#64748B]">
              Running on: {projects[0].domain}
            </p>
          </div>
        </div>
        <Card>
          <ExperimentForm projectId={defaultProjectId} />
        </Card>
      </div>
    </>
  )
}
