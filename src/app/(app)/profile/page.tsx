"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Calendar,
  Building2,
  ShieldCheck,
  Award,
  LogOut,
  Clock,
  Target,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { AuthGate } from "@/components/dashboard/auth-gate";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { GridOverlay } from "@/components/backgrounds/grid";
import { useAuth } from "@/components/auth/auth-context";

const stats = [
  { icon: ShieldCheck, label: "Cases resolved", value: "1,284", tone: "text-primary-300" },
  { icon: Target, label: "Detection accuracy", value: "98.7%", tone: "text-success-400" },
  { icon: Clock, label: "Avg. response", value: "3m 12s", tone: "text-accent-300" },
  { icon: Trophy, label: "Analyst rank", value: "#3", tone: "text-warning-400" },
];

const skills = ["Voice forensics", "Graph analysis", "AML", "PSD2 / SCA", "Phishing triage", "Incident response"];
const achievements = [
  { label: "Ring-breaker", desc: "Dismantled a 300+ account mule network", tone: "text-danger-400" },
  { label: "Sharpshooter", desc: "50 true positives, zero false alarms", tone: "text-success-400" },
  { label: "First responder", desc: "Fastest escalation this quarter", tone: "text-accent-300" },
];

export default function ProfilePage() {
  return (
    <AuthGate label="your profile">
      <ProfileContent />
    </AuthGate>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const joined = new Date(user.createdAt);
  const joinedLabel = Number.isNaN(joined.getTime())
    ? "—"
    : joined.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const details = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Building2, label: "Company", value: user.company || "—" },
    { icon: ShieldCheck, label: "Role", value: user.role },
    { icon: Calendar, label: "Joined", value: joinedLabel },
  ];

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" description="Your analyst identity, performance, and activity." />

      {/* cover + identity */}
      <GlassCard className="relative overflow-hidden p-0">
        <div className="relative h-20 overflow-hidden bg-gradient-to-br from-primary-900/60 via-ink-900 to-accent-900/40 sm:h-28">
          <GridOverlay size="40px" fade={false} />
          {/* Animated glow orbs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 animate-float rounded-full bg-primary-500/30 blur-[64px]" />
          <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 animate-float-slow rounded-full bg-accent-500/20 blur-[64px]" />
          {/* Dark fade at bottom to blend into the card content */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink-900/90 to-transparent" />
        </div>
        
        <div className="relative flex flex-col gap-4 px-6 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pb-6">
          <div className="-mt-8 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:items-end sm:gap-5">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="relative shrink-0 rounded-full bg-gradient-to-b from-primary-400 to-accent-500 p-[3px] shadow-glow-cyan"
            >
              <div className="rounded-full border-4 border-ink-900 bg-ink-900">
                <Avatar initials={user.initials} size="xl" status="online" />
              </div>
            </motion.div>
            
            <div className="pb-1">
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <h2 className="text-h2 font-bold tracking-tight text-white">{user.name}</h2>
                <Badge tone="primary" dot className="border-primary-500/30 bg-primary-500/10 shadow-glow-cyan/20">
                  Verified
                </Badge>
              </motion.div>
              <motion.p 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-1 flex items-center gap-2 text-body font-medium text-primary-200"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{user.role}</span>
                {user.company && (
                  <>
                    <span className="text-ink-600">•</span>
                    <Building2 className="h-4 w-4 text-ink-400" />
                    <span className="text-ink-400">{user.company}</span>
                  </>
                )}
              </motion.p>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="z-10 pb-1"
          >
            <Button 
              variant="secondary" 
              size="md" 
              onClick={() => logout()}
              className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-glow"
            >
              <span className="relative z-10 flex items-center gap-2">
                <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Sign out
              </span>
            </Button>
          </motion.div>
        </div>
      </GlassCard>

      {/* stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard className="p-5">
              <s.icon className={`h-5 w-5 ${s.tone}`} />
              <div className="mt-3 tabular text-h2 font-bold text-ink-50">{s.value}</div>
              <div className="text-micro text-ink-500">{s.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* details + skills */}
        <div className="space-y-4 lg:col-span-1">
          <GlassCard className="p-5">
            <span className="text-body-sm font-semibold text-ink-100">Details</span>
            <div className="mt-4 space-y-3">
              {details.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-ink-400">
                    <d.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-micro text-ink-500">{d.label}</div>
                    <div className="truncate text-body-sm text-ink-200">{d.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <span className="text-body-sm font-semibold text-ink-100">Specializations</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* activity + achievements */}
        <div className="space-y-4 lg:col-span-2">
          <GlassCard className="p-5">
            <span className="text-body-sm font-semibold text-ink-100">Recent activity</span>
            <div className="mt-4">
              <ActivityTimeline />
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-warning-400" />
              <span className="text-body-sm font-semibold text-ink-100">Achievements</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {achievements.map((a) => (
                <div key={a.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                  <Award className={`mx-auto h-7 w-7 ${a.tone}`} />
                  <div className="mt-2 text-label font-semibold text-ink-100">{a.label}</div>
                  <div className="mt-0.5 text-micro text-ink-500">{a.desc}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
