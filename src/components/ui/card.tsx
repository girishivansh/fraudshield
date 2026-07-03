"use client";

import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type CardProps = HTMLMotionProps<"div"> & {
  /** add hover-lift interaction */
  interactive?: boolean;
  /** animated gradient ring border */
  gradient?: boolean;
  /** top highlight edge */
  highlight?: boolean;
  glow?: boolean;
  children?: ReactNode;
};

export const GlassCard = forwardRef<HTMLDivElement, CardProps>(function GlassCard(
  { className, interactive, gradient, highlight = true, glow, children, ...props },
  ref
) {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "glass rounded-3xl",
        highlight && "glass-highlight overflow-hidden",
        gradient && "gradient-border",
        glow && "shadow-glow",
        interactive &&
          "transition-colors duration-300 hover:bg-white/[0.055] hover:border-white/15",
        className
      )}
      {...(interactive
        ? { whileHover: { y: -5 }, transition: { type: "spring", stiffness: 400, damping: 30 } }
        : {})}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex items-start justify-between gap-4 p-5 sm:p-6", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h3 className={cn("text-h4 font-semibold text-ink-100", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("mt-1 text-body-sm text-ink-400", className)}>{children}</p>;
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex items-center gap-3 border-t border-white/[0.06] p-5 sm:px-6", className)}>
      {children}
    </div>
  );
}
