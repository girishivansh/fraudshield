# FraudShield AI — Design System

> **AI Cybersecurity Intelligence Command Center**
> _Detect. Prevent. Protect._

A premium, motion-rich design language for a futuristic fraud-intelligence platform — built to feel like Lovable × Linear × Vercel × Stripe × Palantir Foundry × Apple.

---

## 1. Design Philosophy

| Principle | What it means here |
|-----------|--------------------|
| **Depth over flatness** | Every screen layers aurora gradients, glow orbs, grid overlays, particles, and noise. Nothing is ever a flat fill. |
| **Glass as the surface** | Information lives on frosted-glass panels with hairline borders, inner highlights, and soft outer glow. |
| **Motion is meaning** | Animation guides attention and tells the detection → prevention → protection story. Never decorative noise. |
| **Data is the hero** | Dense, legible, tabular-aligned metrics. The UI frames intelligence; it never competes with it. |
| **Calm, then alert** | A composed dark canvas that escalates to amber/red only when risk demands it. |

---

## 2. Color System

Defined in `tailwind.config.ts` (full 50–950 scales) and consumed via semantic utilities.

### Brand
- **Primary (electric blue)** — `#60A5FA` `#3B82F6` `#2563EB` … `primary-{50..950}`
- **Accent (cyan / signal)** — `#22D3EE` `#06B6D4` … `accent-{50..950}`

### Status
- **Success** `#10B981` · **Warning** `#F59E0B` · **Danger** `#EF4444` (each with 400/500/600)

### Surfaces — `ink`
`ink-950 #020617` → `ink-925 #030712` (app bg) → `ink-900 #0B1120` → `ink-850 #0F172A` → … → `ink-200`

### Semantic helpers
`surface`, `surface-2`, `hairline` (white-alpha tints) · gradient presets `bg-primary-gradient`, `bg-risk-gradient`, `bg-aurora`, `bg-mesh`, `bg-spotlight`, `bg-text-gradient`.

### Risk → color mapping (`lib/utils.ts → riskMeta`)
`minimal` emerald · `low` cyan · `elevated` amber · `high` / `critical` red. One source of truth for every risk badge, gauge, and score.

---

## 3. Typography

**Geist Sans** (UI + headlines) and **Geist Mono** (data, IDs, code) via `next/font`.

Fluid scale (`clamp()`-based, defined in `tailwind.config.ts → fontSize`):

| Token | Use |
|-------|-----|
| `text-display-2xl / xl / display / display-sm` | Hero & section headlines (3.25–7.5rem) |
| `text-h1 … h4` | Page & card headings |
| `text-body-lg / body / body-sm` | Prose |
| `text-label` | Form labels, dense UI |
| `text-overline` | Eyebrows / kickers (uppercase, tracked) |
| `text-micro` | Captions, timestamps |

Helpers: `.text-gradient`, `.text-gradient-primary`, `.text-gradient-danger`, `.text-glow`, `.tabular`.

---

## 4. Spacing, Radius & Layout

- **Base unit** 4px (Tailwind default scale).
- **Section rhythm** `py-section` = `clamp(5rem, 10vw, 9rem)`; **page gutter** `px-gutter` = `clamp(1.25rem, 5vw, 2.5rem)`.
- **Containers** `max-w-shell` (1600), `max-w-content` (1200), `max-w-prose` (68ch). Use the `.shell` helper.
- **Radii** soft & generous: `rounded-2xl/3xl/4xl/5xl` for glass panels.
- **Breakpoints** Tailwind defaults + `3xl` 1920px and `4xl` 2560px for ultra-wide command-center layouts.

---

## 5. Elevation & Glass Recipe

One reusable recipe (`globals.css → @layer components`):

- `.glass` — `bg-white/[0.03]` + `backdrop-blur-xl` + hairline border + `shadow-glass`.
- `.glass-strong` — heavier blur/alpha for modals & key panels.
- `.glass-panel` — `.glass` + `rounded-3xl`.
- `.glass-highlight` — adds the bright top edge.
- `.gradient-border` — animated mask-based gradient ring.
- Shadows: `shadow-glow`, `shadow-glow-cyan/danger/success`, `shadow-glass`, `shadow-elevated`.

---

## 6. Background System

`components/backgrounds/` — composed by `<SceneBackground variant="marketing | app | auth | minimal" />`:

- `AuroraBackground` — drifting multi-radial aurora (`animate-aurora`).
- `GlowOrbs` — floating, blurred color orbs (`animate-float-slow`).
- `GridOverlay` / `ScanLine` — cyber grid with radial fade + sweeping radar line.
- `Particles` — canvas constellation with proximity links (reduced-motion aware, DPR-scaled).
- `NoiseOverlay` — SVG fractal-noise grain via `mix-blend-soft-light`.
- `SpotlightArea` — pointer-following radial spotlight (updates `--mx/--my`, no re-render).

**Rule:** no screen ships without a `SceneBackground`.

---

## 7. Motion System

`lib/motion.ts` — central presets, consumed through `components/motion/`:

- **Springs** `soft`, `snappy`, `gentle`, `bouncy`. **Eases** `out`, `inOut`, `back`.
- **Variants** `fadeUp`, `fadeDown`, `fadeIn`, `scaleIn`, `blurReveal`, `fromLeft/Right`, `pageTransition`.
- **Orchestration** `staggerContainer()` + `staggerItem`; `viewportOnce` for scroll reveals; `hoverLift` for cards.
- **Primitives** `<Reveal>`, `<Stagger>/<StaggerItem>`, `<Counter>` (spring count-up in view), `<Marquee>`.
- **Keyframe utilities** `animate-float`, `float-slow`, `pulse-glow`, `shimmer`, `gradient-x`, `aurora`, `scan`, `marquee`, `ping-slow`, `border-flow`.
- **Accessibility** global `prefers-reduced-motion` reset in `globals.css`; canvas/counter components honor it too.

---

## 8. Component Language

All primitives in `components/ui/` share the glass + glow + spring vocabulary:

Buttons · Cards / GlassCard · Badge · Input · Select · Textarea · Switch · Tabs · Tooltip · Modal / Drawer / Dialog · Progress · RiskMeter · Avatar · Skeleton.

Domain components in `components/dashboard/` and `components/marketing/` are built from these primitives so the language stays consistent everywhere.

---

## 9. Responsive Strategy

- Fluid type & spacing via `clamp()` — scales smoothly from 320px to 2560px.
- App shell: sidebar collapses to icons → drawer on mobile; top bar condenses.
- Grids reflow `1 → 2 → 3/4` columns at `sm/lg/xl`; ultra-wide uses `3xl/4xl` to add density, not whitespace.
- Tested at **375 / 768 / 1280 / 1920 / 2560 px**.

---

## 10. File Map

```
src/
  app/                 # routes (root + auth + app groups)
  components/
    backgrounds/       # aurora, grid, noise, particles, spotlight, scene
    motion/            # reveal, stagger, counter, marquee
    ui/                # primitive library
    marketing/         # landing sections
    dashboard/         # command-center widgets
  lib/                 # utils, motion, constants, mock-data
  hooks/               # media-query, mounted
```
