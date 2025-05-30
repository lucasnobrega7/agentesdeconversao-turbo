import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProviderEnterprise } from '@/components/theme-provider-enterprise'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Agentes de Conversão - Plataforma Enterprise',
  description: 'Sistema completo de agentes de IA para conversão e atendimento',
  keywords: 'agentes IA, chatbot, automação, conversação, WhatsApp, Telegram',
  authors: [{ name: 'Agentes de Conversão' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProviderEnterprise
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProviderEnterprise>
      </body>
    </html>
  )
}