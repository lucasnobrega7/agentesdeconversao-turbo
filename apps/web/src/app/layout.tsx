import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

// Optimize font loading with Turbopack
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Agentes de Conversão - IA Conversacional Enterprise',
  description: 'Plataforma enterprise de inteligência artificial conversacional para comunicação omnichannel e automação de processos de negócio.',
  // metadataBase: new URL('https://agentesdeconversao.ai'), // Disabled for development
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://agentesdeconversao.ai',
    siteName: 'Agentes de Conversão',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Agentes de Conversão',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@agentesdeconversao',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// Remove unnecessary exports for production build

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}