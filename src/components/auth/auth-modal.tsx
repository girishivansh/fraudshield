"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, Lock, User, Building2, Eye, EyeOff, ArrowRight, Sparkles, X, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-context";
import { ApiError } from "@/lib/client-api";
import { SITE } from "@/lib/constants";

/**
 * Global "Sign in to continue" modal. Rendered once by AuthProvider.
 * On success it resumes the exact analysis the user started — the user
 * is never bounced to the dashboard. Talks to the real /api/auth routes.
 */
export function AuthModal() {
  const { authOpen, closeAuth, intentLabel, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // reset transient state whenever the modal re-opens
  useEffect(() => {
    if (authOpen) {
      setLoading(false);
      setError(null);
    }
  }, [authOpen]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ name, email, password, company });
      }
      // On success the context closes the modal and resumes the pending action.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <Modal open={authOpen} onClose={closeAuth} size="md" className="p-0">
      <div className="relative">
        <button
          onClick={closeAuth}
          className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Brand + intent */}
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gradient shadow-glow">
              <ShieldCheck className="h-7 w-7 text-white" />
            </span>
            <h2 className="mt-4 text-h3 font-bold text-ink-100">
              {isLogin ? "Sign in to continue" : `Create your ${SITE.name} account`}
            </h2>
            <p className="mt-1 max-w-xs text-body-sm text-ink-400">
              {intentLabel ? (
                <>
                  Your analysis is ready — {isLogin ? "sign in" : "create an account"} to run{" "}
                  <span className="text-ink-200">{intentLabel}</span> and see the full verdict.
                </>
              ) : (
                <>Access your {SITE.name} investigation workspace.</>
              )}
            </p>
          </div>

          {intentLabel && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-primary-400/20 bg-primary-500/[0.07] px-3 py-2 text-micro text-primary-200"
            >
              <Sparkles className="h-3.5 w-3.5" />
              We&apos;ll bring you right back to where you left off.
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="mt-6 space-y-3">
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-2.5 overflow-hidden"
                >
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    icon={<User className="h-4 w-4" />}
                    autoComplete="name"
                    required={!isLogin}
                  />
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company"
                    icon={<Building2 className="h-4 w-4" />}
                    autoComplete="organization"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              required
            />
            <Input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              icon={<Lock className="h-4 w-4" />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="text-ink-400 transition-colors hover:text-ink-200"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-danger-400/25 bg-danger-500/[0.08] px-3 py-2 text-micro text-danger-300">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? (isLogin ? "Signing in…" : "Creating account…") : isLogin ? "Sign in & continue" : "Create account & continue"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-5 text-center text-micro text-ink-500">
            {isLogin ? (
              <>
                New to {SITE.name}?{" "}
                <button onClick={() => { setMode("register"); setError(null); }} className="text-primary-300 hover:text-primary-200">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(null); }} className="text-primary-300 hover:text-primary-200">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </Modal>
  );
}
