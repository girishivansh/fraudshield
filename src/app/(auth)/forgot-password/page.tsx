"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  }

  if (sent) {
    return (
      <AuthCard title="Check your inbox" subtitle="A password reset link is on its way.">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center rounded-2xl border border-success-400/20 bg-success-500/10 p-8 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-500/15 text-success-400">
            <MailCheck className="h-7 w-7" />
          </span>
          <p className="mt-4 text-body-sm text-ink-300">
            We sent reset instructions to your email. The link expires in 30 minutes.
          </p>
        </motion.div>
        <Button variant="secondary" size="lg" className="mt-6 w-full" onClick={() => setSent(false)}>
          Resend email
        </Button>
        <p className="mt-4 text-center text-label">
          <Link href="/login" className="text-ink-500 hover:text-ink-300">
            ← Back to sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a secure reset link."
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Work email"
          type="email"
          placeholder="you@company.com"
          icon={<Mail className="h-4 w-4" />}
          required
        />
        <Button type="submit" size="lg" loading={loading} className="w-full group">
          Send reset link
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>
      <p className="mt-6 text-center text-body-sm text-ink-400">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary-300 hover:text-primary-200">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
