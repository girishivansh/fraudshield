"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-8 lg:hidden">
        <Logo size={34} />
      </div>
      <h1 className="text-h1 font-bold text-ink-50">{title}</h1>
      <p className="mt-2 text-body-sm text-ink-400">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </motion.div>
  );
}

export function SocialRow() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {["Google", "SSO"].map((p) => (
          <button
            key={p}
            type="button"
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-body-sm font-medium text-ink-200 backdrop-blur-md transition-colors hover:bg-white/[0.06]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-primary-400 to-accent-400 text-[10px] font-bold text-white">
              {p[0]}
            </span>
            {p}
          </button>
        ))}
      </div>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-micro uppercase tracking-widest text-ink-500">or continue with email</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
    </>
  );
}
