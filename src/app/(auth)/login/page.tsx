"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/auth/auth-context";
import { ApiError } from "@/lib/client-api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    try {
      await login(email, password);
      // Return the user to the homepage workspace (not the dashboard).
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your FraudShield AI command center."
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Work email"
          name="email"
          type="email"
          placeholder="you@company.com"
          icon={<Mail className="h-4 w-4" />}
          required
        />
        <Input
          label="Password"
          name="password"
          type={show ? "text" : "password"}
          placeholder="••••••••••"
          icon={<Lock className="h-4 w-4" />}
          trailing={
            <button type="button" onClick={() => setShow((v) => !v)} className="text-ink-400 hover:text-ink-200">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
        />
        <div className="flex items-center justify-between">
          <Switch checked={remember} onChange={setRemember} label="Remember me" />
          <Link href="/forgot-password" className="text-label text-primary-300 hover:text-primary-200">
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-danger-400/25 bg-danger-500/[0.08] px-3 py-2 text-label text-danger-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full group">
          Sign in
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-ink-400">
        New to FraudShield?{" "}
        <Link href="/register" className="font-medium text-primary-300 hover:text-primary-200">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
