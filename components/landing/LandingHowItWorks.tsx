import { UserPlus, Code2, MousePointerClick, TrendingUp } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Sign up & connect your site',
    description:
      'Create your OptiFlow account in 30 seconds. Add a single `<script>` tag to your site\'s `<head>`. OptiFlow confirms the connection instantly.',
  },
  {
    step: '02',
    icon: MousePointerClick,
    title: 'Build your variation visually',
    description:
      'Install the Chrome extension. Navigate to your page, click any element, and edit it live. Change headlines, button colors, hero images — no code.',
  },
  {
    step: '03',
    icon: Code2,
    title: 'Set your goal & audience',
    description:
      'Define what "winning" means — a button click, a form submit, a page visit. Choose who sees the test: desktop users, Google traffic, new visitors.',
  },
  {
    step: '04',
    icon: TrendingUp,
    title: 'Launch and watch the data',
    description:
      'Hit "Start Test." OptiFlow splits traffic, tracks conversions, and runs Bayesian analysis in real time. Get a clear winner — usually within days, not weeks.',
  },
]

export function LandingHowItWorks() {
  return (
    <section className="py-24 bg-[#F8FAFC]" id="how-it-works">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="inline-block rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-semibold text-[#065F46] mb-4">
            How It Works
          </span>
          <h2 className="text-4xl font-bold text-[#0F172A] lg:text-5xl">
            From idea to live test in{' '}
            <span className="text-[#10B981]">under 15 minutes</span>
          </h2>
          <p className="mt-4 text-lg text-[#64748B] max-w-2xl mx-auto">
            Our goal is to get you to &ldquo;Aha!&rdquo; as fast as possible. No dev handoffs,
            no approval cycles, no sprint planning.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-8 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-[#4F46E5] via-[#6366F1] to-transparent opacity-20 lg:block"
          />

          <div className="grid gap-8 lg:grid-cols-2">
            {steps.map((s, i) => {
              const Icon = s.icon
              const isRight = i % 2 === 1
              return (
                <article
                  key={s.step}
                  className={`flex gap-5 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm ${
                    isRight ? 'lg:mt-12' : ''
                  }`}
                >
                  <div className="shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F46E5]">
                      <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-[#CBD5E1] font-tabular">
                        {s.step}
                      </span>
                      <div className="h-px flex-1 bg-[#E2E8F0]" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#64748B]">
                      {s.description}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
