import {
  LayoutDashboard,
  ScanSearch,
  AudioLines,
  Share2,
  Map,
  FileBarChart,
  Bell,
  Settings,
  User,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export const SITE = {
  name: "FraudShield AI",
  tagline: "Detect. Prevent. Protect.",
  description:
    "AI-powered cybersecurity intelligence platform that detects, prevents, and neutralizes fraud in real time.",
};

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  group: "intelligence" | "workspace" | "account";
};

export const APP_NAV: NavItem[] = [
  { label: "History & Intelligence", href: "/dashboard", icon: LayoutDashboard, group: "intelligence" },
  { label: "Scam Analyzer", href: "/scam-analyzer", icon: ScanSearch, group: "workspace", badge: "AI" },
  { label: "Voice Analysis", href: "/voice-analysis", icon: AudioLines, group: "workspace" },
  { label: "Fraud Network", href: "/fraud-network", icon: Share2, group: "workspace" },
  { label: "Crime Heatmap", href: "/crime-heatmap", icon: Map, group: "intelligence" },
  { label: "Reports", href: "/reports", icon: FileBarChart, group: "intelligence" },
  { label: "Notifications", href: "/notifications", icon: Bell, group: "account", badge: 6 },
  { label: "Profile", href: "/profile", icon: User, group: "account" },
];

export const NAV_GROUPS: { id: NavItem["group"]; label: string }[] = [
  { id: "intelligence", label: "Intelligence" },
  { id: "workspace", label: "Analysis Workspace" },
  { id: "account", label: "Account" },
];

export const MARKETING_NAV = [
  { label: "Platform", href: "#features" },
  { label: "AI Engine", href: "#ai" },
  { label: "Threat Intel", href: "#threat-intel" },
  { label: "Customers", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];
