import { HeroSection } from '@/components/sections/hero'
import { FeaturesGrid } from '@/components/sections/features-grid'
import { CtaSection } from '@/components/sections/cta'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesGrid />
      <CtaSection />
    </main>
  )
}