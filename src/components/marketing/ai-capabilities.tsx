"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Zap, Eye, RefreshCw, Check } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { GlassCard } from "@/components/ui/card";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { CAPABILITIES } from "@/lib/mock-data";

const points = [
  { icon: Zap, title: "Sub-40ms scoring", desc: "Per-event decisions at the edge, before the transaction clears." },
  { icon: Eye, title: "Explainable verdicts", desc: "Every score ships with the exact signals that drove it." },
  { icon: RefreshCw, title: "Self-learning models", desc: "New fraud patterns become detections automatically." },
];

export function AICapabilities() {
  return (
    <section id="ai" className="relative py-section">
      <div className="shell grid items-center gap-12 lg:grid-cols-2">
        {/* left: copy */}
        <div>
          <SectionHeading
            align="left"
            eyebrow="The AI engine"
            title={<>Intelligence that <span className="text-gradient-primary">thinks ahead</span></>}
            description="A continuously-learning model ensemble trained on 2.1B labeled events — turning raw signals into decisions your analysts can trust and explain."
          />

          <div className="mt-8 space-y-3">
            {points.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-primary-300 ring-1 ring-primary-400/20">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-body-sm font-semibold text-ink-100">{p.title}</div>
                    <div className="text-body-sm text-ink-400">{p.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* right: AI core visual + stat tiles */}
        <Reveal variants={undefined} className="relative">
          <GlassCard className="relative overflow-hidden p-8">
            <AICore />
            <div className="mt-8 grid grid-cols-2 gap-3">
              {CAPABILITIES.map((c) => (
                <div key={c.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="tabular text-h2 font-bold text-gradient-primary">{c.value}</div>
                  <div className="mt-1 text-label text-ink-200">{c.title}</div>
                  <div className="text-micro text-ink-500">{c.detail}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

function AICore() {
  const rings = [0, 1, 2];
  return (
    <div className="relative mx-auto flex h-56 w-full items-center justify-center">
      {/* rotating rings */}
      {rings.map((r) => (
        <motion.div
          key={r}
          className="absolute rounded-full border border-primary-400/20"
          style={{ width: 120 + r * 60, height: 120 + r * 60 }}
          animate={{ rotate: r % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 18 + r * 8, repeat: Infinity, ease: "linear" }}
        >
          <span
            className="absolute h-2 w-2 rounded-full bg-accent-400 shadow-glow-cyan"
            style={{ top: -4, left: "50%" }}
          />
        </motion.div>
      ))}
      {/* pulsing core */}
      <motion.div
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary-gradient shadow-glow-lg"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute inset-0 rounded-full bg-primary-500/40 blur-xl" />
        <BrainCircuit className="relative h-10 w-10 text-white" />
      </motion.div>

      {/* counter overlay */}
      <div className="absolute bottom-0 left-0 rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 backdrop-blur-md">
        <div className="tabular text-label font-semibold text-accent-300">
          <Counter to={2840} suffix=" /s" />
        </div>
        <div className="text-micro text-ink-500">detections</div>
      </div>
      <div className="absolute right-0 top-2 flex items-center gap-1.5 rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 backdrop-blur-md">
        <Check className="h-3.5 w-3.5 text-success-400" />
        <span className="text-micro text-ink-300">model healthy</span>
      </div>
    </div>
  );
}
