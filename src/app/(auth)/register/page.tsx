"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Building2, ArrowRight, Check, AlertCircle } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import { ApiError } from "@/lib/client-api";

const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = Math.min(4, [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((r) => r.test(pw)).length);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) return;
    setLoading(true);
    setError(null);
    try {
      await register({ name, email, password: pw, company });
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create your account. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Start protecting your business in minutes — free.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Full name"
            placeholder="Alex Rivera"
            icon={<User className="h-4 w-4" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Company"
            placeholder="Northwind"
            icon={<Building2 className="h-4 w-4" />}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <Input
          label="Work email"
          type="email"
          placeholder="you@company.com"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            icon={<Lock className="h-4 w-4" />}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
          {pw && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < strength
                        ? strength <= 1
                          ? "bg-danger-500"
                          : strength === 2
                          ? "bg-warning-500"
                          : strength === 3
                          ? "bg-accent-400"
                          : "bg-success-500"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-micro text-ink-400">{strengthLabels[Math.max(0, strength - 1)]}</span>
            </div>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-body-sm text-ink-400">
          <button
            type="button"
            onClick={() => setAgree((v) => !v)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
              agree ? "border-primary-400/50 bg-primary-gradient" : "border-white/15 bg-white/[0.04]"
            }`}
          >
            {agree && <Check className="h-3.5 w-3.5 text-white" />}
          </button>
          <span>
            I agree to the <span className="text-primary-300">Terms of Service</span> and{" "}
            <span className="text-primary-300">Privacy Policy</span>.
          </span>
        </label>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-danger-400/25 bg-danger-500/[0.08] px-3 py-2 text-label text-danger-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} disabled={!agree} className="w-full group">
          Create account
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-ink-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary-300 hover:text-primary-200">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
