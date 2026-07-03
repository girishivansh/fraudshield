import { tooMany } from "./api";

/* ============================================================
   Lightweight in-memory sliding-window rate limiter.
   Suitable for a single-instance deployment / demo. Keyed by
   client IP + bucket name. Throws ApiError(429) when exceeded.
   ============================================================ */

type Hit = { count: number; resetAt: number };
const store = new Map<string, Hit>();

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

/**
 * @param bucket  logical name (e.g. "login", "analyze")
 * @param limit   max hits per window
 * @param windowMs window size in ms (default 60s)
 */
export function rateLimit(req: Request, bucket: string, limit: number, windowMs = 60_000) {
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const hit = store.get(key);

  if (!hit || hit.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  hit.count += 1;
  if (hit.count > limit) {
    const secs = Math.ceil((hit.resetAt - now) / 1000);
    throw tooMany(`Rate limit exceeded. Try again in ${secs}s.`);
  }
}
