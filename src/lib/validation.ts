import { z } from "zod";

/* Zod request schemas + input sanitization. */

/** Strip control characters (keeps tab/newline/CR) and cap length. */
export function sanitize(input: string, max = 20_000): string {
  let out = "";
  for (const ch of input) {
    const c = ch.charCodeAt(0);
    const isControl = (c >= 0 && c <= 8) || (c >= 11 && c <= 12) || (c >= 14 && c <= 31) || c === 127;
    if (!isControl) out += ch;
  }
  return out.trim().slice(0, max);
}

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(200),
  company: z.string().max(120).optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required").max(200),
});

export const messageSchema = z.object({
  input: z.string().min(1, "Provide a message to analyze").max(20_000),
});

export const emailSchema = z.object({
  input: z.string().min(1, "Provide an email to analyze").max(50_000),
});

export const voiceSchema = z.object({
  transcript: z.string().max(50_000).optional(),
});

export const reportSchema = z.object({
  analysisId: z.string().optional(),
  title: z.string().max(200).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
