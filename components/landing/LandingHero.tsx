import Link from 'next/link'
import { ArrowRight, Play, Zap } from 'lucide-react'

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[#0F172A] min-h-screen flex items-center">
      {/* Gradient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-20 h-[400px] w-[400px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-10 h-[300px] w-[300px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #10B981 0%, transparent 70%)',
        }}
      />

      {/* Grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#1E293B] px-4 py-1.5">
          <Zap className="h-3.5 w-3.5 text-[#4F46E5]" aria-hidden="true" />
          <span className="text-xs font-medium text-[#94A3B8]">
            Powered by GrowthBook&apos;s statistical engine
          </span>
          <span className="h-1 w-1 rounded-full bg-[#10B981]" aria-hidden="true" />
          <span className="text-xs text-[#10B981] font-medium">Beta</span>
        </div>

        {/* Heading */}
        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white lg:text-7xl">
          A/B Testing Without{' '}
          <span
            className="inline-block bg-clip-text text-transparent animate-gradient"
            style={{
              backgroundImage: 'linear-gradient(135deg, #4F46E5, #6366F1, #10B981)',
            }}
          >
            Waiting for Developers
          </span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#94A3B8]">
          OptiFlow gives growth marketers a visual drag-and-drop editor to create
          and launch A/B tests in minutes — no engineering tickets, no sprint queues.
          Powered by Bayesian statistics so you know exactly when you&apos;ve won.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#4338CA] hover:shadow-lg hover:shadow-indigo-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
          >
            Start free — no credit card
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-[#334155] bg-transparent px-8 py-3.5 text-sm font-semibold text-[#F1F5F9] transition-all hover:bg-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
          >
            <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            See how it works
          </a>
        </div>

        {/* Social proof numbers */}
        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 border-t border-[#1E293B] pt-12">
          {[
            { value: '< 15 min', label: 'Time to first live test' },
            { value: '87%', label: 'Avg. stat. confidence' },
            { value: '3.2×', label: 'Faster test velocity' },
            { value: '4.8★', label: 'Chrome extension rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-white font-tabular">{stat.value}</p>
              <p className="mt-1 text-sm text-[#64748B]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Dashboard preview */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#334155] bg-[#1E293B] overflow-hidden shadow-2xl shadow-black/50">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 border-b border-[#334155] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#EF4444] opacity-80" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#F59E0B] opacity-80" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#10B981] opacity-80" aria-hidden="true" />
              <div className="ml-4 flex-1 rounded-md bg-[#273449] px-3 py-1 text-xs text-[#64748B] text-left max-w-xs">
                app.optiflow.io/experiments
              </div>
            </div>
            {/* Dashboard mock */}
            <DashboardMock />
          </div>
          {/* Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1 rounded-2xl opacity-20 blur-xl"
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
            }}
          />
        </div>
      </div>
    </section>
  )
}

function DashboardMock() {
  const experiments = [
    { name: 'Homepage H1 Copy Test', status: 'running', cvr: '+12.4%', conf: '87%' },
    { name: 'Pricing Page CTA Color', status: 'completed', cvr: '+6.8%', conf: '95%' },
    { name: 'Onboarding Step 2 Form', status: 'running', cvr: '+3.1%', conf: '61%' },
  ]

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: 'Active Experiments', value: '3', trend: '+1 this week' },
          { label: 'Avg. Conversion Lift', value: '7.4%', trend: 'vs. baseline' },
          { label: 'Visitors Tracked', value: '12.4K', trend: 'this month' },
          { label: 'Tests Won', value: '8', trend: 'out of 11 total' },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl bg-[#273449] p-3 text-left"
          >
            <p className="text-xs text-[#64748B]">{m.label}</p>
            <p className="mt-1 text-xl font-bold text-white font-tabular">{m.value}</p>
            <p className="mt-0.5 text-xs text-[#10B981]">{m.trend}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#334155] overflow-hidden">
        <div className="grid grid-cols-4 gap-4 border-b border-[#334155] bg-[#273449] px-4 py-2 text-xs font-medium text-[#64748B] text-left">
          <span>Experiment</span>
          <span>Status</span>
          <span>Lift</span>
          <span>Confidence</span>
        </div>
        {experiments.map((exp) => (
          <div
            key={exp.name}
            className="grid grid-cols-4 gap-4 px-4 py-3 text-xs border-b border-[#1E293B] last:border-0 text-left"
          >
            <span className="text-[#F1F5F9] truncate">{exp.name}</span>
            <span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  exp.status === 'running'
                    ? 'bg-[#D1FAE5] text-[#065F46]'
                    : 'bg-[#EEF2FF] text-[#3730A3]'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    exp.status === 'running' ? 'bg-[#10B981]' : 'bg-[#6366F1]'
                  }`}
                  aria-hidden="true"
                />
                {exp.status}
              </span>
            </span>
            <span className="text-[#10B981] font-medium font-tabular">{exp.cvr}</span>
            <span className="text-[#F1F5F9] font-tabular">{exp.conf}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
