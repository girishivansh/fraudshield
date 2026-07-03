"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeft, ShieldAlert } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { APP_NAV, NAV_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";

export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
  mobile = false,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const showLabels = mobile || !collapsed;
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className={cn("flex items-center gap-2 px-4 py-5", collapsed && !mobile ? "justify-center" : "justify-between")}>
        {showLabels ? <Logo size={32} /> : <LogoMark size={32} />}
        {!mobile && onToggle && (
          <button
            onClick={onToggle}
            className="hidden rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/[0.06] hover:text-white lg:block"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2 no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.id}>
            {showLabels && (
              <p className="mb-1.5 px-3 text-micro font-semibold uppercase tracking-widest text-ink-600">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {APP_NAV.filter((i) => i.group === group.id).map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const link = (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium transition-colors",
                      active ? "text-white" : "text-ink-400 hover:text-ink-100 hover:bg-white/[0.04]",
                      collapsed && !mobile && "justify-center"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 -z-10 rounded-xl border border-primary-400/20 bg-primary-500/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary-gradient" />
                    )}
                    <item.icon className={cn("h-5 w-5 shrink-0", active && "text-primary-300")} />
                    {showLabels && <span className="flex-1 truncate">{item.label}</span>}
                    {showLabels && item.badge && (
                      <Badge tone={typeof item.badge === "number" ? "danger" : "accent"}>{item.badge}</Badge>
                    )}
                  </Link>
                );
                return (
                  <li key={item.href}>
                    {collapsed && !mobile ? (
                      <Tooltip content={item.label} side="right">
                        {link}
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* threat status + user */}
      <div className="space-y-3 border-t border-white/[0.06] p-3">
        {showLabels && (
          <div className="rounded-2xl border border-warning-400/20 bg-warning-500/[0.08] p-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning-400" />
              <span className="text-label font-semibold text-warning-400">Elevated threat level</span>
            </div>
            <p className="mt-1 text-micro text-ink-400">Global risk index at 63 — monitoring 6 critical events.</p>
          </div>
        )}
        <div className={cn("flex items-center gap-3 rounded-xl p-2", collapsed && !mobile && "justify-center")}>
          <Avatar initials={user?.initials || "AO"} status="online" size="sm" />
          {showLabels && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-label font-semibold text-ink-100">{user?.name || "Aisha Okafor"}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
