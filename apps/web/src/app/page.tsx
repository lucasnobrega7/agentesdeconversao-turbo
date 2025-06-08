import { HeroSection } from '@/components/sections/hero'
import { FeaturesGrid } from '@/components/sections/features-grid'
import { CtaSection } from '@/components/sections/cta'

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* HeroSection now includes its own header and 3D visuals */}
      <HeroSection />
      <FeaturesGrid />
      <CtaSection />

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Agentes de Conversão. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}