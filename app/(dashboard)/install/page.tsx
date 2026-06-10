import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { SnippetDisplay } from '@/components/install/SnippetDisplay'
import { CheckCircle2, Circle } from 'lucide-react'

export const metadata: Metadata = { title: 'Install OptiFlow' }

export default async function InstallPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user!.id)

  const project = projects?.[0]

  return (
    <>
      <Header breadcrumb={[{ label: 'Install' }]} />
      <div className="p-6 max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            Install OptiFlow on your site
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Add a single script tag to start tracking and running experiments.
          </p>
        </div>

        {/* Installation checklist */}
        <div className="space-y-3">
          {[
            {
              step: 1,
              done: !!project,
              title: 'Project created',
              description: project
                ? `${project.name} (${project.domain})`
                : 'Create a project to get your snippet key',
            },
            {
              step: 2,
              done: project?.is_verified ?? false,
              title: 'Script installed & verified',
              description: 'OptiFlow detected on your site',
            },
            {
              step: 3,
              done: false,
              title: 'Install Chrome extension',
              description: 'Required for visual experiment editor',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4 dark:border-[#334155] dark:bg-[#1E293B]"
            >
              {item.done ? (
                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-[#10B981] mt-0.5"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="h-5 w-5 shrink-0 text-[#CBD5E1] mt-0.5"
                  aria-hidden="true"
                />
              )}
              <div>
                <p className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]">
                  {item.title}
                </p>
                <p className="text-xs text-[#64748B]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Snippet */}
        <Card>
          <CardHeader>
            <CardTitle>Your tracking snippet</CardTitle>
            <CardDescription>
              Add this code to the{' '}
              <code className="rounded bg-[#F1F5F9] px-1 py-0.5 text-xs dark:bg-[#273449]">
                &lt;head&gt;
              </code>{' '}
              of every page you want to test.
            </CardDescription>
          </CardHeader>
          <SnippetDisplay
            snippetKey={project?.snippet_key ?? ''}
            isVerified={project?.is_verified ?? false}
            projectId={project?.id ?? ''}
          />
        </Card>

        {/* Platform guides */}
        <Card>
          <CardHeader>
            <CardTitle>Platform-specific guides</CardTitle>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: 'Webflow', icon: '▲', color: 'bg-[#F1F5F9]' },
              { name: 'Framer', icon: '◆', color: 'bg-[#EEF2FF]' },
              { name: 'WordPress', icon: '●', color: 'bg-[#D1FAE5]' },
            ].map((p) => (
              <button
                key={p.name}
                className={`flex items-center gap-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] p-4 text-left transition-colors hover:border-[#4F46E5]/30 ${p.color} dark:bg-[#273449]`}
              >
                <span className="text-xl" aria-hidden="true">
                  {p.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]">
                    {p.name}
                  </p>
                  <p className="text-xs text-[#64748B]">View guide →</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
