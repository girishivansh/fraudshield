"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, ShieldAlert, Sparkles, FileText, ArrowUpRight, Check, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const toneIcon = {
  danger: { icon: ShieldAlert, cls: "bg-danger-500/12 text-danger-400" },
  accent: { icon: Sparkles, cls: "bg-accent-500/12 text-accent-300" },
  primary: { icon: FileText, cls: "bg-primary-500/12 text-primary-300" },
  warning: { icon: ArrowUpRight, cls: "bg-warning-500/12 text-warning-400" },
  success: { icon: Check, cls: "bg-success-500/12 text-success-400" },
} as const;

const tabs = ["All", "Unread", "Critical"] as const;

export default function NotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");

  const filtered = items.filter((n) =>
    tab === "All" ? true : tab === "Unread" ? n.unread : n.tone === "danger"
  );

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Every alert, model update, and case event — prioritized so you never miss a critical signal."
        actions={
          <Button variant="secondary" size="md" onClick={() => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1 w-fit backdrop-blur-md">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-xl px-4 py-2 text-label font-medium transition-colors",
              tab === t ? "bg-primary-500/15 text-primary-200" : "text-ink-400 hover:text-ink-200"
            )}
          >
            {t}
            {t === "Unread" && (
              <span className="ml-1.5 rounded-full bg-danger-500/20 px-1.5 text-micro text-danger-400">
                {items.filter((n) => n.unread).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <GlassCard>
        <div className="divide-y divide-white/[0.05]">
          {filtered.map((n, i) => {
            const t = toneIcon[n.tone as keyof typeof toneIcon];
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
                className={cn(
                  "flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]",
                  n.unread && "bg-primary-500/[0.03]"
                )}
              >
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", t.cls)}>
                  <t.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-semibold text-ink-100">{n.title}</span>
                    {n.tone === "danger" && <Badge tone="danger">Critical</Badge>}
                  </div>
                  <p className="mt-0.5 text-body-sm text-ink-400">{n.body}</p>
                  <span className="mt-1 block text-micro text-ink-500">{n.ago}</span>
                </div>
                {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-400" />}
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Bell className="h-8 w-8 text-ink-600" />
              <p className="text-body-sm text-ink-500">You&apos;re all caught up.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </>
  );
}
