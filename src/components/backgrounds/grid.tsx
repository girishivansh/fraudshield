import { cn } from "@/lib/utils";

/** Cybersecurity grid overlay with a radial fade. */
export function GridOverlay({
  className,
  size = "56px",
  fade = true,
}: {
  className?: string;
  size?: string;
  fade?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        fade && "mask-radial",
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
        backgroundSize: `${size} ${size}`,
      }}
    />
  );
}

/** A single vertical "radar" scan line sweeping down. */
export function ScanLine({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent animate-scan" />
    </div>
  );
}
