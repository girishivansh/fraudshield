"use client";

import { motion } from "framer-motion";
import {
  ScanSearch,
  AudioLines,
  Share2,
  Map,
  BrainCircuit,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  tone: string;
  span?: string;
  badge?: string;
};

const features: Feature[] = [
  {
    icon: ScanSearch,
    title: "Real-time scam analyzer",
    desc: "Paste any message, email, or URL and get an instant AI risk verdict with a full breakdown of every red flag — domain spoofing, urgency lures, and credential traps.",
    tone: "from-primary-500/20 to-accent-500/10 text-primary-300",
    span: "lg:col-span-2",
    badge: "Most used",
  },
  {
    icon: BrainCircuit,
    title: "Predictive AI engine",
    desc: "Models that forecast emerging campaigns hours before they peak — and auto-push new signatures to every edge detector.",
    tone: "from-indigo-500/20 to-primary-500/10 text-indigo-300",
    span: "lg:row-span-2",
  },
  {
    icon: AudioLines,
    title: "Voice clone detection",
    desc: "Spectral fingerprinting catches synthetic and deepfake voices in live calls.",
    tone: "from-accent-500/20 to-cyan-500/10 text-accent-300",
  },
  {
    icon: Share2,
    title: "Fraud network graph",
    desc: "One mule reveals the whole ring — accounts, devices, wallets, and phones connected live.",
    tone: "from-fuchsia-500/20 to-primary-500/10 text-fuchsia-300",
  },
  {
    icon: Map,
    title: "Global crime heatmap",
    desc: "Watch fraud pressure shift across 190+ countries with live regional intelligence.",
    tone: "from-emerald-500/20 to-accent-500/10 text-emerald-300",
    span: "lg:col-span-2",
  },
  {
    icon: FileBarChart,
    title: "Investigation reports",
    desc: "Audit-grade case files and analytics, exportable in a click.",
    tone: "from-amber-500/20 to-danger-500/10 text-amber-300",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-section">
      <div className="shell">
        <SectionHeading
          eyebrow="The platform"
          title={<>One command center for <span className="text-gradient-primary">every fraud vector</span></>}
          description="Replace a stack of disconnected tools with a single, AI-native intelligence platform built for analysts who live in the data."
        />

        <motion.div
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-14 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className={f.span}>
              <GlassCard interactive className="group h-full p-6">
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110",
                      f.tone
                    )}
                  >
                    <f.icon className="h-6 w-6" />
                  </span>
                  {f.badge && <Badge tone="primary">{f.badge}</Badge>}
                </div>
                <h3 className="mt-5 text-h4 font-semibold text-ink-50">{f.title}</h3>
                <p className="mt-2 text-body-sm text-ink-400">{f.desc}</p>

                {/* decorative bottom glow line */}
                <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
