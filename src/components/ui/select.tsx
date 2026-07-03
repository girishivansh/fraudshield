"use client";

import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    options: Option[];
    containerClassName?: string;
  }
>(function Select({ className, containerClassName, label, options, id, ...props }, ref) {
  const autoId = useId();
  const selId = id ?? autoId;
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={selId} className="mb-1.5 block text-label text-ink-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selId}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-3.5 pr-10 text-body-sm text-ink-100 backdrop-blur-md outline-none transition-all duration-200",
            "focus:border-primary-400/60 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]",
            "[&>option]:bg-ink-850 [&>option]:text-ink-100",
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      </div>
    </div>
  );
});
