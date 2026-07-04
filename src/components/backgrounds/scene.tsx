import { cn } from "@/lib/utils";
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
    <div className={cn("fixed inset-0 -z-10 overflow-hidden bg-black", className)} aria-hidden>
      {/* pure black base */}
      <div className="absolute inset-0 bg-black" />

      {variant !== "minimal" && (
        <GridOverlay size={variant === "app" ? "44px" : "64px"} />
      )}

      {particles && variant !== "minimal" && (
        <Particles className="opacity-40" density={variant === "app" ? 0.00006 : 0.00009} />
      )}

      <NoiseOverlay />
    </div>
  );
}
