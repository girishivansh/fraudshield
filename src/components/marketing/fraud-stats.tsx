"use client";

import { motion } from "framer-motion";
import { TrendingDown, ShieldCheck, Clock, Users } from "lucide-react";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { staggerContainer, fadeUp } from "@/lib/motion";

const stats = [
  { icon: TrendingDown, to: 71, suffix: "%", label: "Average chargeback reduction", sub: "in the first quarter", tone: "text-success-400" },
  { icon: Clock, to: 40, prefix: "<", suffix: "ms", label: "Decision latency", sub: "per scored event", tone: "text-accent-300" },
  { icon: ShieldCheck, to: 18.4, prefix: "$", suffix: "B+", decimals: 1, label: "Fraud losses prevented", sub: "across our network", tone: "text-primary-300" },
  { icon: Users, to: 420, suffix: "+", label: "Risk teams protected", sub: "in 190+ countries", tone: "text-warning-400" },
];

export function FraudStats() {
  return (
    <section className="relative py-section">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl border border-white/[0.08] bg-gradient-to-br from-primary-600/20 via-ink-900/40 to-accent-600/10 p-8 sm:p-12">
            {/* glow accents */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-accent-500/15 blur-3xl" />

            <div className="relative max-w-2xl">
              <h2 className="text-display-sm font-semibold text-ink-50">
                Fraud costs the world <span className="text-gradient-danger">$485B a year.</span>
              </h2>
              <p className="mt-3 text-body-lg text-ink-300">
                FraudShield AI turns that tide — measurable impact from day one, proven across billions of events.
              </p>
            </div>

            <motion.div
              variants={staggerContainer(0.1, 0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="relative mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4"
            >
              {stats.map((s) => (
                <motion.div key={s.label} variants={fadeUp}>
                  <s.icon className={`h-6 w-6 ${s.tone}`} />
                  <div className="mt-3 tabular text-display-sm font-bold text-ink-50">
                    <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals ?? 0} />
                  </div>
                  <div className="mt-1 text-body-sm font-medium text-ink-200">{s.label}</div>
                  <div className="text-micro text-ink-500">{s.sub}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
