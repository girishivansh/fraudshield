"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "@/components/auth/auth-context";

/**
 * App-wide providers.
 * MotionConfig reducedMotion="user" makes EVERY Framer Motion animation
 * automatically respect the OS "reduce motion" setting (transforms are
 * skipped, only opacity animates) — a global accessibility guarantee.
 * AuthProvider carries the mock session + the global "sign in to continue"
 * modal so any surface can gate an action behind login and resume it after.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>{children}</AuthProvider>
    </MotionConfig>
  );
}
