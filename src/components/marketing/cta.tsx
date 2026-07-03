"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ScanLine } from "@/components/backgrounds/grid";

export function CTA() {
  return (
    <section className="relative py-section">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-ink-900/60 to-ink-850/40 px-6 py-16 text-center sm:px-12 sm:py-24">
            {/* effects */}
            <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-500/25 blur-[100px]" />
            <ScanLine />

            <div className="relative mx-auto max-w-2xl">
              <span className="chip mx-auto mb-6 w-fit">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-300" />
                Deploy in under 2 weeks
              </span>
              <h2 className="text-display font-bold text-ink-50">
                Stop fraud before it
                <br />
                <span className="text-gradient-primary text-glow">costs you everything.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-body-lg text-ink-300">
                Join 420+ risk teams who turned FraudShield AI into their command center. Start free — no card required.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="xl" className="group">
                    Start protecting free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="xl" variant="secondary">
                    Talk to sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
