import Link from 'next/link'
import { Check, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try OptiFlow risk-free. No credit card needed.',
    mtu: '2,500 MTU / month',
    cta: 'Get started free',
    ctaHref: '/signup',
    ctaVariant: 'outline' as const,
    highlighted: false,
    features: [
      '1 active experiment',
      '2,500 monthly tracked users',
      'Chrome extension access',
      'Basic Bayesian stats',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$59',
    period: 'per month',
    description: 'For startups and growth teams moving at speed.',
    mtu: '50,000 MTU / month',
    cta: 'Start Pro trial',
    ctaHref: '/signup?plan=pro',
    ctaVariant: 'primary' as const,
    highlighted: true,
    badge: 'Most popular',
    features: [
      'Unlimited active experiments',
      '50,000 monthly tracked users',
      'Advanced audience segmentation',
      'Full Bayesian dashboard',
      'Email support (< 24h)',
      'API access',
      'Custom conversion goals',
    ],
  },
  {
    name: 'Enterprise',
    price: '$299+',
    period: 'per month',
    description: 'Custom limits and enterprise-grade features for scale.',
    mtu: 'Custom MTU limits',
    cta: 'Talk to sales',
    ctaHref: 'mailto:sales@optiflow.io',
    ctaVariant: 'outline' as const,
    highlighted: false,
    features: [
      'Everything in Pro',
      'Multi-armed bandit traffic allocation',
      'SSO (SAML)',
      'Dedicated Customer Success Manager',
      'SLA guarantee',
      'Custom data retention',
      'Priority support (< 4h)',
    ],
  },
]

export function LandingPricing() {
  return (
    <section className="py-24 bg-[#0F172A]" id="pricing">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="inline-block rounded-full border border-[#334155] bg-[#1E293B] px-3 py-1 text-xs font-semibold text-[#94A3B8] mb-4">
            Pricing
          </span>
          <h2 className="text-4xl font-bold text-white lg:text-5xl">
            Pay for results,{' '}
            <span className="text-[#4F46E5]">not seat licenses</span>
          </h2>
          <p className="mt-4 text-lg text-[#64748B] max-w-xl mx-auto">
            Pricing scales with your traffic, not your team size. Every plan
            includes the full visual editor and Bayesian engine.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col gap-6 ${
                plan.highlighted
                  ? 'bg-[#4F46E5] ring-2 ring-[#6366F1] shadow-2xl shadow-indigo-900/50'
                  : 'bg-[#1E293B] border border-[#334155]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#92400E]">
                    <Zap className="h-3 w-3" aria-hidden="true" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-[#F1F5F9]'}`}>
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold font-tabular ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-indigo-200' : 'text-[#64748B]'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${plan.highlighted ? 'text-indigo-200' : 'text-[#64748B]'}`}>
                  {plan.description}
                </p>
                <div className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${plan.highlighted ? 'bg-indigo-600 text-indigo-100' : 'bg-[#273449] text-[#94A3B8]'}`}>
                  {plan.mtu}
                </div>
              </div>

              <Link
                href={plan.ctaHref}
                className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  plan.highlighted
                    ? 'bg-white text-[#4F46E5] hover:bg-indigo-50 focus-visible:ring-white focus-visible:ring-offset-[#4F46E5]'
                    : 'border border-[#334155] text-[#F1F5F9] hover:bg-[#273449] focus-visible:ring-[#4F46E5]'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3" role="list">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlighted ? 'text-indigo-200' : 'text-[#10B981]'}`}
                      aria-hidden="true"
                    />
                    <span className={`text-sm ${plan.highlighted ? 'text-indigo-100' : 'text-[#94A3B8]'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[#64748B]">
          All plans include SSL encryption, GDPR-compliant data processing, and
          access to the Chrome extension.{' '}
          <a href="/privacy" className="text-[#4F46E5] hover:underline">
            Privacy policy
          </a>
        </p>
      </div>
    </section>
  )
}
