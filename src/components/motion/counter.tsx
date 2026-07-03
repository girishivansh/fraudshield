"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

type CounterProps = {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** custom formatter wins over decimals/prefix/suffix */
  format?: (v: number) => string;
  className?: string;
};

/** Animated number that counts up when scrolled into view. */
export function Counter({
  to,
  from = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();

  const mv = useMotionValue(from);
  const spring = useSpring(mv, { stiffness: 70, damping: 22, mass: 1 });

  useEffect(() => {
    if (inView) mv.set(reduced ? to : to);
  }, [inView, to, mv, reduced]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) {
      node.textContent = prefix + to.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      return;
    }
    const unsub = spring.on("change", (v) => {
      node.textContent = format
        ? format(v)
        : prefix +
          v.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }) +
          suffix;
    });
    return () => unsub();
  }, [spring, decimals, prefix, suffix, format, reduced, to]);

  return (
    <span ref={ref} className={className}>
      {format ? format(from) : prefix + from.toFixed(decimals) + suffix}
    </span>
  );
}
