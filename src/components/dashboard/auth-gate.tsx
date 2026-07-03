"use client";

import type { ReactNode } from "react";
import { ShieldCheck, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Gates an authenticated page. While the session is resolving it shows a
 * skeleton; when signed out it prompts the user to sign in (opening the
 * global auth modal) instead of firing 401s at the API.
 */
export function AuthGate({ children, label }: { children: ReactNode; label?: string }) {
  const { hydrated, isAuthenticated, openAuth } = useAuth();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-white/[0.04]" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gradient shadow-glow">
            <ShieldCheck className="h-7 w-7 text-white" />
          </span>
          <h2 className="mt-4 text-h3 font-bold text-ink-100">Sign in required</h2>
          <p className="mt-1 text-body-sm text-ink-400">
            Sign in to access {label ?? "this workspace"} and your investigation data.
          </p>
          <Button onClick={() => openAuth(label)} size="lg" className="mt-5">
            <LogIn className="h-4 w-4" />
            Sign in to continue
          </Button>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
