import { cn } from "@/lib/utils";
import { AuroraBackground, GlowOrbs } from "./aurora";
import { GridOverlay } from "./grid";
import { NoiseOverlay } from "./noise";
import { Particles } from "./particles";

type Variant = "marketing" | "app" | "auth" | "minimal";

/**
 * Layered background scene — guarantees every screen has depth.
 * Fixed behind content; composes aurora + orbs + grid + particles + noise.
 */
export function SceneBackground({
  variant = "marketing",
  className,
  particles = true,
}: {
  variant?: Variant;
  className?: string;
  particles?: boolean;
}) {
  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden bg-ink-925", className)} aria-hidden>
      {/* base vertical wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-925 to-ink-950" />

      {variant !== "minimal" && <AuroraBackground />}
      <GlowOrbs className={variant === "auth" ? "opacity-90" : undefined} />

      {variant !== "minimal" && (
        <GridOverlay size={variant === "app" ? "44px" : "64px"} />
      )}

      {particles && variant !== "minimal" && (
        <Particles className="opacity-60" density={variant === "app" ? 0.00006 : 0.00009} />
      )}

      {/* top + bottom vignette for focus */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink-950/90 to-transparent" />

      <NoiseOverlay />
    </div>
  );
}
