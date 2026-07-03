"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Activity, Lock } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { GridOverlay } from "@/components/backgrounds/grid";
import { Counter } from "@/components/motion/counter";
import { staggerContainer, fadeUp } from "@/lib/motion";

const chips = [
  { icon: ShieldCheck, label: "Threats blocked today", to: 48213, tone: "text-primary-300" },
  { icon: Activity, label: "AI detections / sec", to: 2840, tone: "text-accent-300" },
];

export function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden border-r border-white/[0.06] lg:flex">
      {/* layered glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/15 via-transparent to-accent-600/10" />
      <GridOverlay size="48px" />
      <div className="pointer-events-none absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-primary-500/20 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full bg-accent-500/15 blur-[110px]" />

      <motion.div
        variants={staggerContainer(0.12, 0.1)}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-full flex-col justify-between p-12"
      >
        <motion.div variants={fadeUp}>
          <Logo size={36} />
        </motion.div>

        <div className="max-w-md">
          <motion.span variants={fadeUp} className="chip mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-success-400 animate-pulse" />
            Intelligence command center
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-display-sm font-bold text-ink-50">
            Where fraud teams
            <br />
            <span className="text-gradient-primary">take control.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-body text-ink-400">
            Sign in to a live, AI-native picture of every threat targeting your business — and the
            tools to stop it in milliseconds.
          </motion.p>

          {/* live stat chips */}
          <motion.div variants={fadeUp} className="mt-8 grid grid-cols-2 gap-3">
            {chips.map((c) => (
              <div key={c.label} className="glass rounded-2xl p-4">
                <c.icon className={`h-5 w-5 ${c.tone}`} />
                <div className="mt-2 tabular text-h3 font-bold text-ink-50">
                  <Counter to={c.to} />
                </div>
                <div className="text-micro text-ink-500">{c.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* trust footer */}
        <motion.div variants={fadeUp} className="flex items-center gap-2 text-micro text-ink-500">
          <Lock className="h-3.5 w-3.5" />
          256-bit encryption · SOC 2 Type II · Trusted by 420+ risk teams
        </motion.div>
      </motion.div>
    </aside>
  );
}
