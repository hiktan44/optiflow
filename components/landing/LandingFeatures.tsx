import { MousePointerClick, BarChart3, Users, Puzzle, Zap, Shield } from 'lucide-react'

const features = [
  {
    icon: MousePointerClick,
    title: 'Visual No-Code Editor',
    description:
      'Click any element on your live site and change text, colors, images, or visibility — all without touching code. Changes go live in seconds via CDN.',
    tag: 'Chrome Extension',
    tagColor: 'text-[#4F46E5] bg-[#EEF2FF]',
  },
  {
    icon: BarChart3,
    title: 'Bayesian Statistics Dashboard',
    description:
      'See "Chance to Win", Expected Lift, and Credible Intervals in plain English. Stop guessing when your test is done — OptiFlow tells you.',
    tag: 'Powered by GrowthBook',
    tagColor: 'text-[#10B981] bg-[#D1FAE5]',
  },
  {
    icon: Users,
    title: 'Advanced Audience Targeting',
    description:
      'Segment by device, geography, UTM source, browser language, or visitor type. Build precise audiences without a single line of JavaScript.',
    tag: 'No-code rules',
    tagColor: 'text-[#F59E0B] bg-[#FEF3C7]',
  },
  {
    icon: Puzzle,
    title: 'One-line Integration',
    description:
      'Drop a single `<script>` tag into your site. Works with Webflow, Framer, WordPress, Shopify — anywhere you can add HTML.',
    tag: '< 2 minutes setup',
    tagColor: 'text-[#6366F1] bg-[#EEF2FF]',
  },
  {
    icon: Zap,
    title: 'Instant CDN Delivery',
    description:
      'Variations are served via Cloudflare CDN with <50ms latency. Anti-flicker technology prevents content shift during page load.',
    tag: 'Global Edge Network',
    tagColor: 'text-[#10B981] bg-[#D1FAE5]',
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description:
      'SOC 2 compliant infrastructure, row-level security on all data, SAML SSO on Enterprise tier. Your visitors\' data never leaves your control.',
    tag: 'Enterprise',
    tagColor: 'text-[#64748B] bg-[#F1F5F9]',
  },
]

export function LandingFeatures() {
  return (
    <section className="py-24 bg-white" id="features">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="inline-block rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4F46E5] mb-4">
            Features
          </span>
          <h2 className="text-4xl font-bold text-[#0F172A] lg:text-5xl">
            Everything growth teams need.{' '}
            <span className="text-[#4F46E5]">Nothing they don&apos;t.</span>
          </h2>
          <p className="mt-4 text-lg text-[#64748B] max-w-2xl mx-auto">
            OptiFlow is purpose-built for marketers who move fast. We handle the
            statistics so you can focus on the experiments.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <article
                key={f.title}
                className="group rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 transition-all hover:border-[#4F46E5]/30 hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-0.5"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-[#E2E8F0] group-hover:bg-[#4F46E5] group-hover:border-[#4F46E5] transition-colors">
                  <Icon
                    className="h-5 w-5 text-[#4F46E5] group-hover:text-white transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <div className="mb-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${f.tagColor}`}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#0F172A] mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#64748B]">{f.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
