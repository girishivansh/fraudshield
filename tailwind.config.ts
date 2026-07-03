import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand: Primary (electric blue) ──────────────────────────
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
          DEFAULT: "#3B82F6",
        },
        // ── Accent: Cyan (intelligence / signal) ────────────────────
        accent: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
          950: "#083344",
          DEFAULT: "#22D3EE",
        },
        // ── Status ──────────────────────────────────────────────────
        success: {
          50: "#ECFDF5",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          DEFAULT: "#10B981",
        },
        warning: {
          50: "#FFFBEB",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          DEFAULT: "#F59E0B",
        },
        danger: {
          50: "#FEF2F2",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          DEFAULT: "#EF4444",
        },
        // ── Ink: command-center surfaces ────────────────────────────
        ink: {
          950: "#020617",
          925: "#030712",
          900: "#0B1120",
          850: "#0F172A",
          800: "#162033",
          750: "#1E293B",
          700: "#293548",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
        },
        // semantic
        background: "#030712",
        surface: "rgba(255,255,255,0.025)",
        "surface-2": "rgba(255,255,255,0.04)",
        hairline: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // fluid display scale
        "display-2xl": ["clamp(3.25rem, 7vw + 1rem, 7.5rem)", { lineHeight: "0.92", letterSpacing: "-0.045em", fontWeight: "700" }],
        "display-xl": ["clamp(2.75rem, 6vw + 0.75rem, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.04em", fontWeight: "700" }],
        "display": ["clamp(2.5rem, 4.5vw + 0.5rem, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.035em", fontWeight: "700" }],
        "display-sm": ["clamp(2rem, 3vw + 0.5rem, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "600" }],
        "h1": ["clamp(1.75rem, 2vw + 0.5rem, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "600" }],
        "h2": ["clamp(1.5rem, 1.5vw + 0.5rem, 2rem)", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" }],
        "h3": ["1.375rem", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" }],
        "h4": ["1.125rem", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", letterSpacing: "-0.005em" }],
        "body": ["1rem", { lineHeight: "1.65" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.6" }],
        "label": ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: "500" }],
        "overline": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.18em", fontWeight: "600" }],
        "micro": ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.04em" }],
      },
      spacing: {
        section: "clamp(5rem, 10vw, 9rem)",
        gutter: "clamp(1.25rem, 5vw, 2.5rem)",
      },
      maxWidth: {
        shell: "1600px",
        content: "1200px",
        prose: "68ch",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      screens: {
        "3xl": "1920px",
        "4xl": "2560px",
      },
      backdropBlur: {
        xs: "2px",
        "4xl": "72px",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(59,130,246,0.55)",
        "glow-lg": "0 0 80px -12px rgba(59,130,246,0.6)",
        "glow-cyan": "0 0 40px -8px rgba(34,211,238,0.5)",
        "glow-danger": "0 0 36px -8px rgba(239,68,68,0.55)",
        "glow-success": "0 0 36px -8px rgba(16,185,129,0.5)",
        glass: "0 8px 32px -4px rgba(2,6,23,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-lg": "0 24px 64px -12px rgba(2,6,23,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 0 1px rgba(255,255,255,0.04)",
        elevated: "0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 8px rgba(2,6,23,0.4), 0 16px 48px -16px rgba(2,6,23,0.8)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #60A5FA 0%, #3B82F6 45%, #06B6D4 100%)",
        "primary-gradient-soft": "linear-gradient(135deg, rgba(96,165,250,0.18), rgba(34,211,238,0.12))",
        "risk-gradient": "linear-gradient(90deg, #10B981 0%, #F59E0B 55%, #EF4444 100%)",
        "aurora": "radial-gradient(60% 80% at 20% 10%, rgba(59,130,246,0.28), transparent 60%), radial-gradient(50% 70% at 85% 20%, rgba(34,211,238,0.22), transparent 55%), radial-gradient(55% 75% at 60% 100%, rgba(99,102,241,0.18), transparent 60%)",
        "mesh": "radial-gradient(at 0% 0%, rgba(59,130,246,0.22) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(34,211,238,0.18) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99,102,241,0.16) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(14,165,233,0.14) 0px, transparent 50%)",
        "spotlight": "radial-gradient(640px circle at var(--mx,50%) var(--my,0%), rgba(59,130,246,0.12), transparent 65%)",
        "grid": "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
        "grid-fade": "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
        "shine": "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.14) 50%, transparent 75%)",
        "text-gradient": "linear-gradient(135deg, #FFFFFF 0%, #BFDBFE 40%, #67E8F9 100%)",
      },
      backgroundSize: {
        "grid-sm": "32px 32px",
        "grid-md": "56px 56px",
        "grid-lg": "88px 88px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0) translateX(0)" },
          "33%": { transform: "translateY(-18px) translateX(8px)" },
          "66%": { transform: "translateY(10px) translateX(-10px)" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-x": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        aurora: {
          "0%,100%": { transform: "translate3d(0,0,0) rotate(0deg)", opacity: "0.8" },
          "50%": { transform: "translate3d(3%,-4%,0) rotate(6deg)", opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%,90%": { opacity: "1" },
          "100%": { transform: "translateY(1000%)", opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "ping-slow": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "75%,100%": { transform: "scale(2.4)", opacity: "0" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(var(--orbit-r,120px)) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(var(--orbit-r,120px)) rotate(-360deg)" },
        },
        "border-flow": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.8s ease both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 14s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        "spin-slow": "spin-slow 28s linear infinite",
        aurora: "aurora 18s ease-in-out infinite",
        scan: "scan 7s linear infinite",
        marquee: "marquee 40s linear infinite",
        blink: "blink 1.2s step-end infinite",
        "ping-slow": "ping-slow 3s cubic-bezier(0,0,0.2,1) infinite",
        "border-flow": "border-flow 6s ease infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22,1,0.36,1)",
        "spring-out": "cubic-bezier(0.34,1.56,0.64,1)",
      },
    },
  },
  plugins: [],
};

export default config;
