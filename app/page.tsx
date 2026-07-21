import { GridBackground } from "@/components/grid-background"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/stats-section"
import { TechnologySection } from "@/components/technology-section"
import { ProcessSection } from "@/components/process-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <GridBackground />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <TechnologySection />
      <ProcessSection />
      <CTASection />
      <Footer />
    </main>
  )
}
