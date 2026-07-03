import Link from "next/link";
import { cn } from "@/lib/utils";

/** Shield + signal mark used across nav, footer, sidebar, and auth. */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 rounded-xl bg-primary-gradient opacity-90 blur-[2px]" />
      <svg viewBox="0 0 24 24" width={size} height={size} className="relative" fill="none">
        <path
          d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10v-6L12 2.5Z"
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1"
        />
        <path d="M8.4 12.2l2.4 2.4 4.8-4.8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  href = "/",
  withText = true,
  size = 32,
}: {
  className?: string;
  href?: string;
  withText?: boolean;
  size?: number;
}) {
  const content = (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} className="transition-transform duration-300 group-hover:scale-105" />
      {withText && (
        <span className="text-h4 font-semibold tracking-tight text-ink-50">
          Fraud<span className="text-gradient-primary">Shield</span>
          <span className="ml-1 align-top text-micro font-mono text-accent-400">AI</span>
        </span>
      )}
    </span>
  );
  return href ? (
    <Link href={href} aria-label="FraudShield AI home">
      {content}
    </Link>
  ) : (
    content
  );
}
