"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, RotateCw } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  function verify() {
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 900);
  }

  return (
    <AuthCard
      title="Verify your identity"
      subtitle={
        <>
          We sent a 6-digit code to{" "}
          <span className="font-medium text-ink-200">you@company.com</span>
        </>
      }
    >
      <div className="mb-6 flex justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-300 ring-1 ring-primary-400/20">
          <ShieldCheck className="h-7 w-7" />
        </span>
      </div>

      <OtpInput onComplete={setCode} />

      <Button
        size="lg"
        loading={loading}
        disabled={code.length !== 6}
        onClick={verify}
        className="mt-6 w-full group"
      >
        Verify &amp; continue
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-body-sm text-ink-400">
        Didn&apos;t get a code?
        <button className="inline-flex items-center gap-1 font-medium text-primary-300 hover:text-primary-200">
          <RotateCw className="h-3.5 w-3.5" />
          Resend
        </button>
      </div>

      <p className="mt-4 text-center text-label">
        <Link href="/login" className="text-ink-500 hover:text-ink-300">
          ← Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
