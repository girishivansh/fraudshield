import { cn } from "@/lib/utils";

/** Subtle film-grain noise via inline SVG turbulence. Adds tactile depth. */
export function NoiseOverlay({ className, opacity = 0.035 }: { className?: string; opacity?: number }) {
  const svg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
    );
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 mix-blend-soft-light", className)}
      style={{ backgroundImage: `url("${svg}")`, opacity }}
    />
  );
}
