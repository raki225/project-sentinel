import { createFileRoute } from "@tanstack/react-router"
import { LandingNav } from "@/components/landing/landing-nav"
import { Hero } from "@/components/landing/hero"
import { StatsBar } from "@/components/landing/stats-bar"
import { FeatureGrid } from "@/components/landing/feature-grid"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CtaSection } from "@/components/landing/cta-section"
import { LandingFooter } from "@/components/landing/landing-footer"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <LandingNav />
      <Hero />
      <StatsBar />
      <FeatureGrid />
      <HowItWorks />
      <CtaSection />
      <LandingFooter />
    </div>
  )
}
