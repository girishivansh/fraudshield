"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell, Command } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import { APP_NAV } from "@/lib/constants";

export function Topbar({
  onOpenMobile,
  onOpenCommand,
}: {
  onOpenMobile: () => void;
  onOpenCommand: () => void;
}) {
  const pathname = usePathname();
  const current = APP_NAV.find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
  const { user, isAuthenticated, openAuth } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-925/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-ink-300 transition-colors hover:bg-white/[0.06] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* breadcrumb / title */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-micro text-ink-500">
            <span>FraudShield</span>
            <span>/</span>
            <span className="text-ink-300">{current?.label ?? "Overview"}</span>
          </div>
          <h1 className="truncate text-h4 font-semibold text-ink-50">{current?.label ?? "Command Center"}</h1>
        </div>

        {/* command trigger */}
        <button
          onClick={onOpenCommand}
          className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-body-sm text-ink-400 transition-colors hover:bg-white/[0.06] md:flex"
        >
          <Search className="h-4 w-4" />
          <span className="w-40 text-left">Search…</span>
          <kbd className="flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-micro">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        <button
          onClick={onOpenCommand}
          className="rounded-lg p-2 text-ink-300 transition-colors hover:bg-white/[0.06] md:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* live status */}
        <div className="hidden items-center xl:flex">
          <Badge tone="success" dot pulse>
            Live
          </Badge>
        </div>

        {/* notifications */}
        <Link
          href="/notifications"
          className="relative rounded-lg p-2 text-ink-300 transition-colors hover:bg-white/[0.06]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-danger-500 opacity-75 animate-ping-slow" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-danger-500" />
          </span>
        </Link>

        {isAuthenticated && user ? (
          <Link href="/profile" className="ml-1" aria-label="Profile">
            <Avatar initials={user.initials} status="online" size="sm" />
          </Link>
        ) : (
          <Button size="sm" variant="secondary" className="ml-1" onClick={() => openAuth()}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
