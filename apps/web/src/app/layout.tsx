import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agentes de Conversão',
  description: 'Plataforma de Agentes de IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}