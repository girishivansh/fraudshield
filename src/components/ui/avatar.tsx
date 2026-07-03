import { cn } from "@/lib/utils";

const gradients = [
  "from-primary-500 to-accent-500",
  "from-indigo-500 to-primary-500",
  "from-accent-500 to-emerald-500",
  "from-fuchsia-500 to-primary-500",
  "from-amber-500 to-danger-500",
];

const sizes = {
  xs: "h-7 w-7 text-micro",
  sm: "h-9 w-9 text-label",
  md: "h-10 w-10 text-body-sm",
  lg: "h-12 w-12 text-body",
  xl: "h-16 w-16 text-h4",
};

export function Avatar({
  initials,
  size = "md",
  status,
  className,
}: {
  initials: string;
  size?: keyof typeof sizes;
  status?: "online" | "busy" | "offline";
  className?: string;
}) {
  const g = gradients[(initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % gradients.length];
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ring-1 ring-white/15",
          g,
          sizes[size]
        )}
      >
        {initials.slice(0, 2).toUpperCase()}
      </span>
      {status && (
        <span
          className={cn(
            "absolute -bottom-0 -right-0 h-3 w-3 rounded-full ring-2 ring-ink-900",
            status === "online" && "bg-success-500",
            status === "busy" && "bg-warning-500",
            status === "offline" && "bg-ink-500"
          )}
        />
      )}
    </span>
  );
}
