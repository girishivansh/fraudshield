"use client";

import { forwardRef, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  containerClassName?: string;
};

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & FieldProps
>(function Input(
  { className, containerClassName, label, hint, error, icon, trailing, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-label text-ink-300">
          {label}
        </label>
      )}
      <div
        className={cn(
          "group relative flex items-center rounded-xl border bg-white/[0.03] backdrop-blur-md transition-all duration-200",
          "border-white/10 focus-within:border-primary-400/60 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]",
          error && "border-danger-500/60 focus-within:border-danger-500/70 focus-within:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
        )}
      >
        {icon && <span className="pl-3.5 text-ink-400 group-focus-within:text-primary-300">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full bg-transparent px-3.5 text-body-sm text-ink-100 placeholder:text-ink-500 outline-none",
            icon && "pl-2.5",
            className
          )}
          {...props}
        />
        {trailing && <span className="pr-3.5 text-ink-400">{trailing}</span>}
      </div>
      {(hint || error) && (
        <p className={cn("mt-1.5 text-micro", error ? "text-danger-400" : "text-ink-500")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(function Textarea({ className, containerClassName, label, hint, error, id, ...props }, ref) {
  const autoId = useId();
  const taId = id ?? autoId;
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={taId} className="mb-1.5 block text-label text-ink-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={taId}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-body-sm text-ink-100 placeholder:text-ink-500 backdrop-blur-md outline-none transition-all duration-200",
          "focus:border-primary-400/60 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]",
          error && "border-danger-500/60",
          className
        )}
        {...props}
      />
      {(hint || error) && (
        <p className={cn("mt-1.5 text-micro", error ? "text-danger-400" : "text-ink-500")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
