import Link from "next/link";
import { Globe, AtSign, MessageCircle, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Scam Analyzer", href: "/scam-analyzer" },
      { label: "Voice Analysis", href: "/voice-analysis" },
      { label: "Fraud Network", href: "/fraud-network" },
      { label: "Crime Heatmap", href: "/crime-heatmap" },
      { label: "Command Center", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Customers", href: "#testimonials" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/help" },
      { label: "Threat reports", href: "/reports" },
      { label: "API status", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "SOC 2", href: "#" },
      { label: "GDPR", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] pt-16">
      <div className="shell">
        <div className="grid gap-10 pb-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* brand + newsletter */}
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-body-sm text-ink-400">
              The AI cybersecurity command center. {SITE.tagline}
            </p>
            <form className="mt-5 flex max-w-xs items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1.5">
              <input
                type="email"
                aria-label="Work email"
                placeholder="Work email"
                className="h-9 flex-1 bg-transparent px-2.5 text-body-sm text-ink-100 placeholder:text-ink-500 outline-none"
              />
              <button aria-label="Subscribe to newsletter" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-gradient text-white shadow-glow transition-transform hover:scale-105">
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-5 flex gap-2">
              {[{ Icon: AtSign, label: "Twitter" }, { Icon: Globe, label: "Website" }, { Icon: MessageCircle, label: "Discord" }].map(({ Icon, label }, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-400 transition-colors hover:border-primary-400/40 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-label font-semibold uppercase tracking-wider text-ink-300">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-body-sm text-ink-500 transition-colors hover:text-ink-100">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-6 sm:flex-row">
          <p className="text-micro text-ink-500">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <Badge tone="success" dot pulse>
            All systems operational
          </Badge>
        </div>
      </div>
    </footer>
  );
}
