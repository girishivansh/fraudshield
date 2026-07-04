"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SceneBackground } from "@/components/backgrounds/scene";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { CommandMenu } from "@/components/dashboard/command-menu";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-screen">
      <SceneBackground variant="app" particles={false} />

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 264 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-white/[0.06] bg-black/60 backdrop-blur-2xl lg:block"
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </motion.aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="glass-strong absolute inset-y-0 left-0 w-72"
            >
              <Sidebar collapsed={false} mobile onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-20" : "lg:pl-[264px]")}>
        <Topbar onOpenMobile={() => setMobileOpen(true)} onOpenCommand={() => setCommandOpen(true)} />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-shell px-4 py-6 sm:px-6 lg:py-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      <CommandMenu open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
