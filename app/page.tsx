import { LandingNav } from '@/components/landing/LandingNav'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingPricing } from '@/components/landing/LandingPricing'
import { LandingCTA } from '@/components/landing/LandingCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata = {
  title: 'OptiFlow — Visual A/B Testing Without Waiting for Developers',
  description:
    'Run A/B tests in minutes using a drag-and-drop visual editor. No dev tickets. Bayesian statistics. For growth marketers who move fast.',
  openGraph: {
    title: 'OptiFlow — Visual A/B Testing Without Waiting for Developers',
    description:
      'Run A/B tests in minutes. No code, no dev tickets. Just results.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OptiFlow — Visual A/B Testing',
    description: 'Run A/B tests in minutes. No code, no dev tickets.',
  },
}

export default function HomePage() {
  return (
    <>
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPricing />
        <LandingCTA />
      </main>
      <LandingFooter />
    </>
  )
}
