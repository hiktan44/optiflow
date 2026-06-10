'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  target_url: z.string().url('Must be a valid URL'),
  traffic_split: z.coerce.number().int().min(1).max(99),
  control_changes: z.string().optional(),
  variation_changes: z.string().min(1, 'Variation changes are required'),
  goal_name: z.string().min(1, 'Goal name is required'),
  goal_type: z.enum(['click', 'pageview', 'custom']),
  goal_selector: z.string().optional(),
  device_targeting: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ExperimentFormProps {
  projectId: string
  experimentId?: string
  defaultValues?: Partial<FormData>
}

const STEPS = ['URL & Name', 'Variations', 'Goals', 'Audience']

export function ExperimentForm({
  projectId,
  experimentId,
  defaultValues,
}: ExperimentFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const isEdit = !!experimentId

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      traffic_split: 50,
      goal_type: 'click',
      ...defaultValues,
    },
  })

  const stepFields: (keyof FormData)[][] = [
    ['name', 'target_url', 'description'],
    ['control_changes', 'variation_changes', 'traffic_split'],
    ['goal_name', 'goal_type', 'goal_selector'],
    ['device_targeting'],
  ]

  const nextStep = async () => {
    const valid = await trigger(stepFields[step])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      let variationChanges: unknown[]
      try {
        variationChanges = JSON.parse(data.variation_changes)
      } catch {
        toast.error('Variation changes must be valid JSON')
        setLoading(false)
        return
      }

      const body = {
        project_id: projectId,
        name: data.name,
        description: data.description,
        target_url: data.target_url,
        traffic_split: data.traffic_split,
        targeting: data.device_targeting
          ? { device: [data.device_targeting] }
          : {},
        variations: [
          { name: 'Control', index: 0, changes: [] },
          { name: 'Variation A', index: 1, changes: variationChanges },
        ],
        goals: [
          {
            name: data.goal_name,
            type: data.goal_type,
            selector: data.goal_selector,
            is_primary: true,
          },
        ],
      }

      const url = isEdit
        ? `/api/experiments/${experimentId}`
        : '/api/experiments'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? 'Request failed')
      }

      toast.success(isEdit ? 'Experiment updated!' : 'Experiment created!')
      router.push('/experiments')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      {/* Step indicator */}
      <nav aria-label="Form steps" className="mb-8">
        <ol className="flex items-center gap-2" role="list">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  i === step
                    ? 'bg-[#4F46E5] text-white'
                    : i < step
                    ? 'bg-[#D1FAE5] text-[#065F46] cursor-pointer hover:bg-[#A7F3D0]'
                    : 'bg-[#F1F5F9] text-[#94A3B8] cursor-default'
                )}
                aria-current={i === step ? 'step' : undefined}
                disabled={i > step}
              >
                {i < step ? '✓' : i + 1}
              </button>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  i === step ? 'text-[#0F172A] dark:text-[#F1F5F9]' : 'text-[#94A3B8]'
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-px w-6 sm:w-10',
                    i < step ? 'bg-[#10B981]' : 'bg-[#E2E8F0] dark:bg-[#334155]'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Step 0: URL & Name */}
        {step === 0 && (
          <div className="space-y-4">
            <Input
              label="Experiment name"
              placeholder="Homepage H1 Copy Test"
              required
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Target URL"
              type="url"
              placeholder="https://yoursite.com/landing"
              required
              hint="The page where this experiment will run"
              error={errors.target_url?.message}
              {...register('target_url')}
            />
            <Textarea
              label="Description"
              placeholder="What hypothesis are you testing?"
              {...register('description')}
            />
          </div>
        )}

        {/* Step 1: Variations */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1">
                Variation A changes (JSON)
              </p>
              <Textarea
                placeholder={`[
  {
    "type": "text",
    "selector": "h1.hero-title",
    "value": "New Headline"
  }
]`}
                className="font-mono text-xs min-h-[150px]"
                error={errors.variation_changes?.message}
                {...register('variation_changes')}
              />
              <p className="mt-1 text-xs text-[#64748B]">
                Paste DOM change JSON from the Chrome extension
              </p>
            </div>
            <Input
              label="Traffic split (%)"
              type="number"
              min={1}
              max={99}
              hint="Percentage of traffic to show Variation A"
              error={errors.traffic_split?.message}
              {...register('traffic_split')}
            />
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="space-y-4">
            <Input
              label="Primary goal name"
              placeholder="CTA Button Click"
              required
              error={errors.goal_name?.message}
              {...register('goal_name')}
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="goal-type"
                className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]"
              >
                Goal type
              </label>
              <select
                id="goal-type"
                className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F1F5F9]"
                {...register('goal_type')}
              >
                <option value="click">Click</option>
                <option value="pageview">Page View</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <Input
              label="CSS selector (for click goals)"
              placeholder=".cta-button, #signup-btn"
              hint="The element users must click to convert"
              {...register('goal_selector')}
            />
          </div>
        )}

        {/* Step 3: Audience */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="device-targeting"
                className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]"
              >
                Device targeting
              </label>
              <select
                id="device-targeting"
                className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F1F5F9]"
                {...register('device_targeting')}
              >
                <option value="">All devices</option>
                <option value="desktop">Desktop only</option>
                <option value="mobile">Mobile only</option>
              </select>
            </div>
            <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#273449] border border-[#E2E8F0] dark:border-[#334155] p-4">
              <p className="text-xs font-medium text-[#64748B] mb-2">
                Advanced targeting (UTM, language) coming in Pro+
              </p>
              <p className="text-xs text-[#94A3B8]">
                Upgrade to Pro to target by UTM source, browser language, visitor
                type, and custom JavaScript conditions.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" loading={loading}>
              {isEdit ? 'Save changes' : 'Create experiment'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
