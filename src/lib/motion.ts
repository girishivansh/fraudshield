import type { Variants, Transition } from "framer-motion";

/* ============================================================
   FraudShield AI — Motion System
   Central spring presets + reusable variants.
   ============================================================ */

export const spring = {
  soft: { type: "spring", stiffness: 120, damping: 18, mass: 0.9 } as Transition,
  snappy: { type: "spring", stiffness: 420, damping: 32 } as Transition,
  gentle: { type: "spring", stiffness: 80, damping: 20 } as Transition,
  bouncy: { type: "spring", stiffness: 300, damping: 14 } as Transition,
};

export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  back: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};

/** Fade + rise — the default reveal. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: ease.out } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.out } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: ease.out } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: ease.out } },
};

export const blurReveal: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(12px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: ease.out } },
};

export const fromLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: ease.out } },
};

export const fromRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: ease.out } },
};

/** Stagger container — children animate in sequence. */
export const staggerContainer = (stagger = 0.08, delayChildren = 0.05): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Child variant pairing with staggerContainer. */
export const staggerItem: Variants = fadeUp;

/** Page transition for route changes. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: ease.out } },
  exit: { opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.3, ease: ease.inOut } },
};

/** Standard viewport config for scroll reveals. */
export const viewportOnce = { once: true, amount: 0.25 } as const;

/** Hover lift for interactive cards. */
export const hoverLift = {
  whileHover: { y: -6, transition: spring.snappy },
  whileTap: { scale: 0.985 },
};
