"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import { APP_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CommandMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const mounted = useMounted();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(
    () => APP_NAV.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      router.push(results[active].href);
      onClose();
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="glass-strong glass-highlight relative z-10 w-full max-w-xl overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
              <Search className="h-5 w-5 text-ink-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search pages, threats, cases, reports…"
                className="h-14 flex-1 bg-transparent text-body text-ink-100 placeholder:text-ink-500 outline-none"
              />
              <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-micro text-ink-500">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-8 text-center text-body-sm text-ink-500">No results for &ldquo;{q}&rdquo;</p>
              )}
              {results.map((item, i) => (
                <button
                  key={item.href}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-body-sm transition-colors",
                    active === i ? "bg-primary-500/[0.12] text-white" : "text-ink-300 hover:bg-white/[0.04]"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", active === i ? "text-primary-300" : "text-ink-400")} />
                  <span className="flex-1">{item.label}</span>
                  {active === i && <CornerDownLeft className="h-4 w-4 text-ink-500" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-white/[0.06] px-4 py-2.5 text-micro text-ink-500">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" /> navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" /> select
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
