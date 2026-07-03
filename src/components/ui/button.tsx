"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
type Size = "sm" | "md" | "lg" | "xl" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  glow?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    "text-white bg-primary-gradient shadow-glow hover:shadow-glow-lg hover:brightness-110 active:brightness-95 border border-white/10",
  secondary:
    "text-ink-100 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 backdrop-blur-md",
  ghost: "text-ink-300 hover:text-white hover:bg-white/[0.06]",
  outline:
    "text-ink-100 border border-white/15 hover:border-primary-400/50 hover:bg-primary-500/10",
  danger:
    "text-white bg-gradient-to-br from-danger-400 to-danger-600 shadow-glow-danger hover:brightness-110 border border-white/10",
  success:
    "text-white bg-gradient-to-br from-success-400 to-success-600 shadow-glow-success hover:brightness-110 border border-white/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-label rounded-lg gap-1.5",
  md: "h-11 px-5 text-body-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-body rounded-xl gap-2",
  xl: "h-14 px-8 text-body-lg rounded-2xl gap-2.5",
  icon: "h-10 w-10 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, glow, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "group relative inline-flex select-none items-center justify-center overflow-hidden font-medium",
        "transition-all duration-200 ease-spring",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-925",
        "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        glow && "shadow-glow",
        className
      )}
      {...props}
    >
      {/* sheen sweep on hover (primary-style buttons) */}
      {(variant === "primary" || variant === "danger" || variant === "success") && (
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-shine bg-[length:200%_100%] opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100" />
      )}
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
