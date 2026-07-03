import { seeded } from "./utils";

/* ============================================================
   Mock intelligence data — frontend only, no backend.
   Deterministic where rendered server+client to avoid hydration drift.
   ============================================================ */

export type Severity = "critical" | "high" | "medium" | "low";

export type ThreatEvent = {
  id: string;
  type: string;
  vector: "Phishing" | "Voice" | "SMS" | "Payment" | "Identity" | "Malware";
  severity: Severity;
  score: number;
  location: string;
  country: string;
  ago: string;
  status: "blocked" | "flagged" | "investigating" | "neutralized";
};

export const THREAT_FEED: ThreatEvent[] = [
  { id: "TX-9F2A", type: "Credential phishing kit detected", vector: "Phishing", severity: "critical", score: 96, location: "Lagos, NG", country: "Nigeria", ago: "just now", status: "blocked" },
  { id: "TX-7C18", type: "AI voice clone — CEO impersonation", vector: "Voice", severity: "critical", score: 92, location: "Austin, US", country: "United States", ago: "2m ago", status: "investigating" },
  { id: "TX-5B40", type: "Smishing campaign — bank OTP lure", vector: "SMS", severity: "high", score: 81, location: "Manila, PH", country: "Philippines", ago: "6m ago", status: "flagged" },
  { id: "TX-3E9D", type: "Card-not-present velocity spike", vector: "Payment", severity: "high", score: 77, location: "São Paulo, BR", country: "Brazil", ago: "11m ago", status: "neutralized" },
  { id: "TX-2A77", type: "Synthetic identity ring surfacing", vector: "Identity", severity: "medium", score: 63, location: "Mumbai, IN", country: "India", ago: "18m ago", status: "investigating" },
  { id: "TX-1F05", type: "Refund-fraud bot cluster", vector: "Payment", severity: "medium", score: 58, location: "Berlin, DE", country: "Germany", ago: "24m ago", status: "blocked" },
  { id: "TX-0D31", type: "Romance-scam wallet drain", vector: "Identity", severity: "high", score: 79, location: "London, UK", country: "United Kingdom", ago: "31m ago", status: "flagged" },
  { id: "TX-0A9C", type: "Malicious APK side-load attempt", vector: "Malware", severity: "low", score: 34, location: "Jakarta, ID", country: "Indonesia", ago: "44m ago", status: "neutralized" },
];

export type MetricCardData = {
  id: string;
  label: string;
  value: number;
  display: string;
  delta: number;
  spark: number[];
  tone: "primary" | "accent" | "success" | "danger" | "warning";
};

export const OVERVIEW_METRICS: MetricCardData[] = [
  { id: "blocked", label: "Threats blocked (24h)", value: 48213, display: "48,213", delta: 12.4, tone: "primary", spark: [22, 28, 26, 35, 33, 41, 38, 46, 44, 52, 49, 58] },
  { id: "saved", label: "Fraud losses prevented", value: 18400000, display: "$18.4M", delta: 8.1, tone: "success", spark: [10, 14, 13, 18, 16, 22, 21, 26, 24, 30, 28, 34] },
  { id: "risk", label: "Avg. global risk index", value: 63, display: "63 / 100", delta: -4.2, tone: "warning", spark: [70, 68, 71, 66, 67, 64, 66, 63, 65, 62, 64, 63] },
  { id: "models", label: "AI detections / sec", value: 2840, display: "2,840", delta: 21.7, tone: "accent", spark: [12, 18, 16, 24, 22, 30, 28, 36, 34, 42, 40, 48] },
];

export type AIInsight = {
  id: string;
  title: string;
  detail: string;
  confidence: number;
  tag: string;
  tone: "danger" | "warning" | "accent" | "success";
};

export const AI_INSIGHTS: AIInsight[] = [
  { id: "ai-1", title: "Coordinated phishing surge predicted", detail: "Pattern correlation across 14 domains suggests a campaign launch within ~6h targeting fintech logins.", confidence: 0.94, tag: "Predictive", tone: "danger" },
  { id: "ai-2", title: "New voice-clone signature isolated", detail: "Spectral artifacts match a previously unseen TTS model. Signature pushed to all edge detectors.", confidence: 0.88, tag: "Model update", tone: "accent" },
  { id: "ai-3", title: "Mule-account cluster contained", detail: "Graph analysis linked 312 accounts to a single beneficiary. Auto-freeze recommended.", confidence: 0.91, tag: "Network", tone: "warning" },
];

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  ago: string;
  tone: "primary" | "success" | "danger" | "accent";
};

export const ACTIVITY: ActivityItem[] = [
  { id: "a1", actor: "Sentinel-7", action: "auto-blocked", target: "payment burst from ASN 14061", ago: "moments ago", tone: "danger" },
  { id: "a2", actor: "A. Okafor", action: "escalated case", target: "#FR-2291 to Tier-3", ago: "3m ago", tone: "warning" as never },
  { id: "a3", actor: "Graph Engine", action: "merged", target: "2 fraud clusters", ago: "9m ago", tone: "accent" },
  { id: "a4", actor: "M. Rossi", action: "cleared", target: "false-positive batch (118)", ago: "15m ago", tone: "success" },
  { id: "a5", actor: "Voice AI", action: "fingerprinted", target: "new TTS model variant", ago: "22m ago", tone: "primary" },
];

/** Region heat for the world map / heatmap page. lat/lng → projected on a 1000x500 equirect. */
export type Region = {
  id: string;
  city: string;
  country: string;
  x: number; // 0..1000
  y: number; // 0..500
  intensity: number; // 0..1
  cases: number;
};

export const REGIONS: Region[] = [
  { id: "r1", city: "Lagos", country: "NG", x: 520, y: 290, intensity: 0.95, cases: 4821 },
  { id: "r2", city: "Mumbai", country: "IN", x: 700, y: 270, intensity: 0.82, cases: 3940 },
  { id: "r3", city: "Manila", country: "PH", x: 815, y: 290, intensity: 0.78, cases: 3120 },
  { id: "r4", city: "São Paulo", country: "BR", x: 350, y: 360, intensity: 0.71, cases: 2780 },
  { id: "r5", city: "London", country: "UK", x: 487, y: 175, intensity: 0.64, cases: 2210 },
  { id: "r6", city: "Austin", country: "US", x: 215, y: 235, intensity: 0.69, cases: 2490 },
  { id: "r7", city: "Berlin", country: "DE", x: 515, y: 175, intensity: 0.52, cases: 1680 },
  { id: "r8", city: "Jakarta", country: "ID", x: 800, y: 345, intensity: 0.58, cases: 1920 },
  { id: "r9", city: "Dubai", country: "AE", x: 610, y: 250, intensity: 0.61, cases: 2040 },
  { id: "r10", city: "Sydney", country: "AU", x: 880, y: 400, intensity: 0.34, cases: 980 },
];

/** Time-series for area charts (last 12 points). */
export const TREND_24H = Array.from({ length: 24 }).map((_, i) => {
  const rnd = seeded(i + 7);
  const base = 1200 + Math.sin(i / 3) * 420 + i * 28;
  return {
    t: `${String(i).padStart(2, "0")}:00`,
    threats: Math.round(base + rnd() * 300),
    blocked: Math.round(base * 0.82 + rnd() * 200),
    flagged: Math.round(base * 0.22 + rnd() * 120),
  };
});

export const VECTOR_BREAKDOWN = [
  { name: "Phishing", value: 38, color: "#3B82F6" },
  { name: "Payment", value: 24, color: "#22D3EE" },
  { name: "Voice", value: 16, color: "#6366F1" },
  { name: "Identity", value: 13, color: "#F59E0B" },
  { name: "Malware", value: 9, color: "#EF4444" },
];

/* ── Fraud network graph ─────────────────────────────────── */
export type GraphNode = {
  id: string;
  label: string;
  type: "account" | "device" | "wallet" | "phone" | "kingpin";
  risk: number;
  x: number;
  y: number;
};
export type GraphLink = { source: string; target: string; weight: number };

export const GRAPH_NODES: GraphNode[] = [
  { id: "k1", label: "Beneficiary α", type: "kingpin", risk: 97, x: 500, y: 300 },
  { id: "w1", label: "Wallet 0x9f…", type: "wallet", risk: 88, x: 360, y: 200 },
  { id: "w2", label: "Wallet 0x2a…", type: "wallet", risk: 84, x: 640, y: 210 },
  { id: "a1", label: "acct_5521", type: "account", risk: 72, x: 250, y: 320 },
  { id: "a2", label: "acct_7740", type: "account", risk: 69, x: 320, y: 430 },
  { id: "a3", label: "acct_1180", type: "account", risk: 64, x: 690, y: 410 },
  { id: "a4", label: "acct_9032", type: "account", risk: 58, x: 760, y: 320 },
  { id: "d1", label: "device_ff12", type: "device", risk: 76, x: 470, y: 460 },
  { id: "d2", label: "device_ab90", type: "device", risk: 61, x: 540, y: 150 },
  { id: "p1", label: "+234·8821", type: "phone", risk: 70, x: 180, y: 230 },
  { id: "p2", label: "+63·9920", type: "phone", risk: 55, x: 820, y: 230 },
];

export const GRAPH_LINKS: GraphLink[] = [
  { source: "k1", target: "w1", weight: 0.9 },
  { source: "k1", target: "w2", weight: 0.85 },
  { source: "w1", target: "a1", weight: 0.7 },
  { source: "w1", target: "a2", weight: 0.6 },
  { source: "w2", target: "a3", weight: 0.65 },
  { source: "w2", target: "a4", weight: 0.6 },
  { source: "a1", target: "p1", weight: 0.5 },
  { source: "a2", target: "d1", weight: 0.55 },
  { source: "a3", target: "d1", weight: 0.5 },
  { source: "a4", target: "p2", weight: 0.45 },
  { source: "k1", target: "d2", weight: 0.7 },
  { source: "d2", target: "w1", weight: 0.4 },
  { source: "a4", target: "a3", weight: 0.35 },
];

/* ── Scam analyzer sample result ─────────────────────────── */
export const SCAM_SAMPLE = `Dear Customer, your account has been temporarily suspended due to unusual activity.
To restore access, verify your identity within 24 hours at http://secure-verify-account.co/login
Failure to act will result in permanent closure. — Account Security Team`;

export const SCAM_SIGNALS = [
  { label: "Urgency & deadline pressure", weight: 0.92, hit: true },
  { label: "Look-alike / spoofed domain", weight: 0.88, hit: true },
  { label: "Credential-harvest call to action", weight: 0.95, hit: true },
  { label: "Generic salutation", weight: 0.46, hit: true },
  { label: "Sender reputation mismatch", weight: 0.71, hit: true },
  { label: "Grammar & tone anomalies", weight: 0.38, hit: false },
];

/* ── Personal analysis history (seed data for a signed-in user) ─── */
export type AnalysisKindTag = "message" | "email" | "voice" | "screenshot" | "report";

export type AnalysisRecord = {
  id: string;
  kind: AnalysisKindTag;
  title: string;
  preview: string;
  score: number;
  ago: string;
};

export const ANALYSIS_HISTORY: AnalysisRecord[] = [
  { id: "MSG-8841", kind: "message", title: "SMS · High-risk scam", preview: "Your parcel is held. Pay a £1.99 fee at royalmail-redelivery…", score: 88, ago: "2h ago" },
  { id: "EML-7720", kind: "email", title: "Email · Likely phishing", preview: "Your account has been suspended. Verify within 24 hours…", score: 94, ago: "5h ago" },
  { id: "VOX-6605", kind: "voice", title: "Voice Call · AI-cloned voice", preview: "recording_from_bank.m4a", score: 91, ago: "yesterday" },
  { id: "IMG-5540", kind: "screenshot", title: "Screenshot · Fraudulent content", preview: "whatsapp_investment.png", score: 79, ago: "yesterday" },
  { id: "MSG-5210", kind: "message", title: "Message · Low risk detected", preview: "Hi, are we still on for lunch tomorrow?", score: 12, ago: "2d ago" },
  { id: "EML-4980", kind: "email", title: "Email · Suspicious content", preview: "You've won a $500 gift card, claim now…", score: 63, ago: "3d ago" },
];

/** Monthly intelligence summary for the history center. */
export const MONTHLY_INTELLIGENCE = {
  month: "June 2026",
  totalAnalyses: 148,
  highRisk: 39,
  reportsGenerated: 12,
  avgRisk: 61,
  deltaAnalyses: 18.2,
  deltaHighRisk: 9.4,
};

/** Scam categories the user has encountered (for the intelligence report). */
export const SCAM_CATEGORIES = [
  { name: "Phishing email", value: 34, color: "#3B82F6" },
  { name: "Smishing (SMS)", value: 26, color: "#22D3EE" },
  { name: "Voice / deepfake", value: 18, color: "#6366F1" },
  { name: "Investment scam", value: 13, color: "#F59E0B" },
  { name: "Impersonation", value: 9, color: "#EF4444" },
];

/** Personal threat-exposure signals (user-specific). */
export const THREAT_EXPOSURE = [
  { label: "Targeted phishing attempts", value: 39, tone: "danger" as const, hint: "blocked before you interacted" },
  { label: "Exposed in known breaches", value: 3, tone: "warning" as const, hint: "email found in 3 leaked datasets" },
  { label: "Repeat-offender senders", value: 7, tone: "warning" as const, hint: "flagged more than once this month" },
  { label: "Clean, verified contacts", value: 62, tone: "success" as const, hint: "analyzed and cleared" },
];

/* ── Reports ─────────────────────────────────────────────── */
export type Report = {
  id: string;
  title: string;
  type: "Investigation" | "Compliance" | "Analytics" | "Incident";
  status: "Final" | "Draft" | "In review";
  risk: number;
  date: string;
  author: string;
  size: string;
};

export const REPORTS: Report[] = [
  { id: "RPT-4821", title: "Q3 Cross-border mule network teardown", type: "Investigation", status: "Final", risk: 91, date: "2026-06-28", author: "A. Okafor", size: "4.2 MB" },
  { id: "RPT-4799", title: "Voice-clone fraud — monthly trend", type: "Analytics", status: "Final", risk: 74, date: "2026-06-25", author: "Voice AI", size: "1.8 MB" },
  { id: "RPT-4790", title: "PSD2 SCA exemption compliance review", type: "Compliance", status: "In review", risk: 38, date: "2026-06-22", author: "M. Rossi", size: "920 KB" },
  { id: "RPT-4781", title: "Incident #FR-2291 post-mortem", type: "Incident", status: "Draft", risk: 83, date: "2026-06-20", author: "Sentinel-7", size: "2.6 MB" },
  { id: "RPT-4775", title: "Synthetic identity ring — APAC", type: "Investigation", status: "Final", risk: 88, date: "2026-06-18", author: "Graph Engine", size: "5.1 MB" },
  { id: "RPT-4760", title: "Refund-abuse model performance", type: "Analytics", status: "Final", risk: 52, date: "2026-06-15", author: "ML Ops", size: "1.1 MB" },
];

/* ── Notifications ───────────────────────────────────────── */
export const NOTIFICATIONS = [
  { id: "n1", title: "Critical: CEO voice-clone attempt", body: "Sentinel flagged an impersonation call targeting finance.", tone: "danger", ago: "2m ago", unread: true },
  { id: "n2", title: "Model deployed: voiceprint v4.2", body: "New TTS detection signature is live across all edges.", tone: "accent", ago: "26m ago", unread: true },
  { id: "n3", title: "Weekly intelligence digest ready", body: "Your team's threat summary for this week is available.", tone: "primary", ago: "1h ago", unread: true },
  { id: "n4", title: "Case #FR-2291 escalated", body: "Tier-3 analyst A. Okafor took ownership.", tone: "warning", ago: "3h ago", unread: false },
  { id: "n5", title: "False-positive batch cleared", body: "118 transactions restored by M. Rossi.", tone: "success", ago: "5h ago", unread: false },
];

/* ── Testimonials / logos / faqs (marketing) ─────────────── */
export const TESTIMONIALS = [
  { quote: "FraudShield cut our chargeback rate by 71% in the first quarter. The graph intelligence is unlike anything we evaluated.", name: "Elena Marković", role: "VP Risk, Northwind Bank", avatar: "EM" },
  { quote: "The voice-clone detection caught a $2.4M wire fraud attempt that would have sailed past our old controls.", name: "David Chen", role: "CISO, Lumen Pay", avatar: "DC" },
  { quote: "It feels like a command center from a sci-fi film, but the analysts actually live in it all day. That's the highest praise.", name: "Aisha Okafor", role: "Head of FinCrime, Zenith", avatar: "AO" },
  { quote: "We replaced four tools with one. Detection latency went from minutes to milliseconds.", name: "Marco Rossi", role: "Director, PayForte", avatar: "MR" },
];

export const LOGOS = ["Northwind", "Lumen Pay", "Zenith", "PayForte", "Helios", "Vanta Bank", "Orbital", "Kestrel"];

export const FAQS = [
  { q: "How fast can FraudShield AI detect a new threat?", a: "Our edge models score events in under 40ms. Novel patterns are surfaced by the predictive engine and pushed to all detectors within minutes, not days." },
  { q: "Do you need access to our raw customer data?", a: "No. FraudShield operates on tokenized signals and behavioral features. Sensitive data never leaves your environment — we analyze derived intelligence." },
  { q: "Can it integrate with our existing stack?", a: "Yes. A single SDK and webhook layer connect to payment, identity, and comms providers. Most teams are live in under two weeks." },
  { q: "What makes the graph intelligence different?", a: "We connect accounts, devices, wallets, and phone signals into a live fraud graph, so a single mule reveals the entire ring — not just one bad transaction." },
  { q: "Is it suitable for regulated industries?", a: "FraudShield is built for banks, fintechs, and marketplaces with SOC 2 Type II, PSD2/SCA, and full audit-grade reporting out of the box." },
];

export const CAPABILITIES = [
  { title: "Real-time scoring", value: "<40ms", detail: "Per-event risk decisions at the edge." },
  { title: "Detection accuracy", value: "99.2%", detail: "Validated across 2.1B labeled events." },
  { title: "False-positive cut", value: "−68%", detail: "Versus legacy rules engines." },
  { title: "Coverage", value: "190+", detail: "Countries with live threat telemetry." },
];
