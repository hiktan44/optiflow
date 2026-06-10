import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'OptiFlow',
    template: '%s | OptiFlow',
  },
  description: 'Visual A/B testing for growth teams — no developers required.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.optiflow.io'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'OptiFlow — Visual A/B Testing Without Waiting for Developers',
    description: 'Visual A/B testing for growth teams — no developers required.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'OptiFlow' }],
    type: 'website',
    siteName: 'OptiFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OptiFlow — Visual A/B Testing Without Waiting for Developers',
    description: 'Visual A/B testing for growth teams — no developers required.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={inter.variable}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
