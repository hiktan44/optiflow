import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ExperimentForm } from '@/components/experiments/ExperimentForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import type { Experiment } from '@/lib/types'

export const metadata: Metadata = { title: 'Edit Experiment' }

export default async function EditExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: experiment } = await supabase
    .from('experiments')
    .select('*')
    .eq('id', id)
    .single()

  if (!experiment) notFound()

  const exp = experiment as Experiment

  if (exp.status === 'running' || exp.status === 'completed') {
    notFound()
  }

  return (
    <>
      <Header
        breadcrumb={[
          { label: 'Experiments', href: '/experiments' },
          { label: exp.name, href: `/experiments/${id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/experiments/${id}`}>← Back</Link>
          </Button>
          <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            Edit Experiment
          </h1>
        </div>
        <Card>
          <ExperimentForm
            projectId={exp.project_id}
            experimentId={id}
            defaultValues={{
              name: exp.name,
              description: exp.description ?? undefined,
              target_url: exp.target_url,
              traffic_split: exp.traffic_split,
            }}
          />
        </Card>
      </div>
    </>
  )
}
