import { cn } from "@/lib/utils";

/** Soft drifting aurora gradient field. Pure CSS, GPU-friendly. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute -inset-[20%] bg-aurora opacity-80 blur-3xl animate-aurora" />
      <div
        className="absolute -inset-[20%] bg-aurora opacity-50 blur-3xl animate-aurora"
        style={{ animationDelay: "-9s", animationDuration: "24s" }}
      />
    </div>
  );
}

/** Floating, pulsing glow orbs for depth. */
export function GlowOrbs({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-primary-500/25 blur-[100px] animate-float-slow" />
      <div
        className="absolute right-[6%] top-[20%] h-80 w-80 rounded-full bg-accent-400/20 blur-[120px] animate-float-slow"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="absolute bottom-[6%] left-[40%] h-96 w-96 rounded-full bg-indigo-500/15 blur-[140px] animate-float-slow"
        style={{ animationDelay: "-8s" }}
      />
    </div>
  );
}
