import dynamic from "next/dynamic";
import { SceneBackground } from "@/components/backgrounds/scene";
import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";

const Personalized = dynamic(() => import("@/components/marketing/personalized").then(mod => mod.Personalized));
const Workspace = dynamic(() => import("@/components/marketing/workspace").then(mod => mod.Workspace));
const LogoCloud = dynamic(() => import("@/components/marketing/logo-cloud").then(mod => mod.LogoCloud));
const Features = dynamic(() => import("@/components/marketing/features").then(mod => mod.Features));
const AICapabilities = dynamic(() => import("@/components/marketing/ai-capabilities").then(mod => mod.AICapabilities));
const ThreatIntel = dynamic(() => import("@/components/marketing/threat-intel").then(mod => mod.ThreatIntel));
const FraudStats = dynamic(() => import("@/components/marketing/fraud-stats").then(mod => mod.FraudStats));
const Testimonials = dynamic(() => import("@/components/marketing/testimonials").then(mod => mod.Testimonials));
const FAQ = dynamic(() => import("@/components/marketing/faq").then(mod => mod.FAQ));
const CTA = dynamic(() => import("@/components/marketing/cta").then(mod => mod.CTA));
const Footer = dynamic(() => import("@/components/marketing/footer").then(mod => mod.Footer));

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
