import { SceneBackground } from "@/components/backgrounds/scene";
import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Personalized } from "@/components/marketing/personalized";
import { Workspace } from "@/components/marketing/workspace";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { Features } from "@/components/marketing/features";
import { AICapabilities } from "@/components/marketing/ai-capabilities";
import { ThreatIntel } from "@/components/marketing/threat-intel";
import { FraudStats } from "@/components/marketing/fraud-stats";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQ } from "@/components/marketing/faq";
import { CTA } from "@/components/marketing/cta";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <>
      <SceneBackground variant="marketing" />
      <Navbar />
      <main className="relative">
        <Hero />
        <Personalized />
        <Workspace />
        <LogoCloud />
        <Features />
        <AICapabilities />
        <ThreatIntel />
        <FraudStats />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
