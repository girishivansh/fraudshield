"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/motion/counter";
import { HeroPreview } from "./hero-preview";
import { staggerContainer, fadeUp } from "@/lib/motion";

const trust = [
  { label: "Fraud prevented", to: 18.4, prefix: "$", suffix: "B+", decimals: 1 },
  { label: "Events scored daily", to: 2.1, suffix: "B", decimals: 1 },
  { label: "Detection accuracy", to: 99.2, suffix: "%", decimals: 1 },
  { label: "Countries covered", to: 190, suffix: "+", decimals: 0 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
      {/* no background glow — pure black */}

      <div className="shell">
        <div
          className="mx-auto max-w-4xl text-center"
        >
          <div className="flex justify-center">
            <span className="chip gap-2 border-primary-400/20 bg-primary-500/[0.07]">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              <span className="text-label text-ink-200">Next-gen AI fraud intelligence</span>
              <span className="mx-1 h-3 w-px bg-white/15" />
              <span className="text-label text-accent-300">v4.2 live</span>
            </span>
          </div>

          <h1
            className="mt-6 text-display-xl font-bold tracking-tight text-ink-50 sm:text-display-2xl"
          >
            Detect fraud
            <br />
            <span className="text-gradient-primary text-glow">before it strikes.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-body-lg text-ink-400"
          >
            FraudShield AI is the intelligence command center that detects scams, voice clones,
            and fraud rings in milliseconds — then prevents the loss before it ever happens.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="xl" className="group">
                <ShieldCheck className="h-5 w-5" />
                Start protecting free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="xl" variant="secondary" className="group">
                <PlayCircle className="h-5 w-5 text-accent-300" />
                Explore the platform
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-micro text-ink-500">
            No credit card required · SOC 2 Type II · GDPR &amp; PSD2 ready
          </p>
        </div>

        {/* product preview */}
        <div className="mt-16">
          <HeroPreview />
        </div>

        {/* trust metrics */}
        <motion.div
          variants={staggerContainer(0.08, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] sm:grid-cols-4"
        >
          {trust.map((t) => (
            <motion.div key={t.label} variants={fadeUp} className="bg-black/40 p-6 text-center backdrop-blur-sm">
              <div className="tabular text-display-sm font-bold text-gradient-primary">
                <Counter to={t.to} prefix={t.prefix} suffix={t.suffix} decimals={t.decimals} />
              </div>
              <div className="mt-1 text-label text-ink-400">{t.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
