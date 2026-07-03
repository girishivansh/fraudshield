"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { GlassCard } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { TESTIMONIALS } from "@/lib/mock-data";
import { staggerContainer, fadeUp } from "@/lib/motion";

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-section">
      <div className="shell">
        <SectionHeading
          eyebrow="Customers"
          title={<>Loved by the teams on the <span className="text-gradient-primary">front line</span></>}
          description="Risk leaders at banks, fintechs, and marketplaces trust FraudShield to protect their customers and their bottom line."
        />

        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-14 grid gap-4 md:grid-cols-2"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} variants={fadeUp} className={i === 0 ? "md:col-span-2" : ""}>
              <GlassCard interactive className="h-full p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <Quote className="h-8 w-8 text-primary-400/40" />
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-warning-400 text-warning-400" />
                    ))}
                  </div>
                </div>
                <p className={`mt-4 text-ink-100 ${i === 0 ? "text-h4 font-medium leading-snug" : "text-body-lg"}`}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar initials={t.avatar} />
                  <div>
                    <div className="text-body-sm font-semibold text-ink-50">{t.name}</div>
                    <div className="text-micro text-ink-500">{t.role}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
