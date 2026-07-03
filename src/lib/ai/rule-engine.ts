export type RuleEngineSignal = {
  label: string;
  weight: number;
  hit: boolean;
  explanation: string;
  riskImpact: number;
};

export type RuleEngineResult = {
  score: number;
  signals: RuleEngineSignal[];
};

const FRAUD_RULES = [
  { pattern: /\b(yourbank|my bank|our bank)\b/i, label: "Generic bank identity", riskImpact: 25 },
  { pattern: /\b(urgent|immediately|act now|expire|final notice|within \d+ (hours|days|minutes))\b/i, label: "Urgency/Fear framing", riskImpact: 15 },
  { pattern: /\b(reply yes|reply no|reply y|reply n|reply stop|call us at)\b/i, label: "Reply-based request", riskImpact: 20 },
  { pattern: /https?:\/\/([^\s]+\.)?(bit\.ly|tinyurl\.com|t\.co|goo\.gl)/i, label: "URL shortener", riskImpact: 20 },
  { pattern: /https?:\/\/|www\./i, label: "Contains URL", riskImpact: 5 },
  { pattern: /\b(password|otp|pin|cvv|one[- ]?time( code)?)\b/i, label: "Credential request", riskImpact: 35 },
  { pattern: /\b(gift card|crypto|bitcoin|western union|wire transfer)\b/i, label: "Irreversible payment demand", riskImpact: 40 },
  { pattern: /\b(won|winner|lottery|prize|refund|inheritance)\b/i, label: "Lottery/prize claim", riskImpact: 35 },
  { pattern: /\b(guarantee|100% return|risk[- ]?free)\b/i, label: "Investment guarantee", riskImpact: 35 },
  { pattern: /\b(subsidy|government benefit|stimulus)\b/i, label: "Government subsidy claim", riskImpact: 25 },
  { pattern: /\b(package|delivery|parcel|dhl|fedex|usps|ups).*(failed|reschedule|fee)\b/i, label: "Fake package delivery", riskImpact: 20 },
  { pattern: /\b(anydesk|teamviewer|remote support)\b/i, label: "Remote support request", riskImpact: 30 },
  { pattern: /\b(police|irs|cbi|fbi|tax office)\b/i, label: "Authority impersonation", riskImpact: 30 },
  { pattern: /\b(dear customer|dear user)\b/i, label: "Generic salutation", riskImpact: 10 },
  { pattern: /\b(kyc|verify your account|suspend)\b/i, label: "KYC/Verification pressure", riskImpact: 25 },
  { pattern: /\b(work from home|part time job|earn \$\d+)\b/i, label: "Job offer scam", riskImpact: 25 },
];

const MITIGATING_RULES = [
  { pattern: /@(sbi\.co\.in|chase\.com|bankofamerica\.com|wellsfargo\.com)/i, label: "Official verified domain", riskImpact: -15 },
  { pattern: /account ending in \d{4}/i, label: "Account-specific details", riskImpact: -10 },
];

export function runRuleEngine(text: string): RuleEngineResult {
  let score = 0;
  const signals: RuleEngineSignal[] = [];
  let hits = 0;

  for (const rule of FRAUD_RULES) {
    if (rule.pattern.test(text)) {
      score += rule.riskImpact;
      hits++;
      signals.push({
        label: rule.label,
        weight: rule.riskImpact / 100,
        hit: true,
        explanation: `Matches deterministic rule for ${rule.label.toLowerCase()}`,
        riskImpact: rule.riskImpact,
      });
    }
  }

  for (const rule of MITIGATING_RULES) {
    if (rule.pattern.test(text)) {
      score += rule.riskImpact;
      signals.push({
        label: rule.label,
        weight: Math.abs(rule.riskImpact) / 100,
        hit: false,
        explanation: `Matches legitimate rule for ${rule.label.toLowerCase()}`,
        riskImpact: rule.riskImpact,
      });
    }
  }

  // Floor adjustments based on hits
  if (hits >= 5 && score < 60) score = 60;
  else if (hits >= 3 && score < 40) score = 40;

  return {
    score: Math.min(Math.max(score, 0), 100),
    signals
  };
}
