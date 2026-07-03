import { NextResponse } from "next/server";
import { ZodError } from "zod";

/* Centralized API error + response helpers. */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const unauthorized = (msg = "Not authenticated") => new ApiError(401, msg);
export const badRequest = (msg = "Bad request") => new ApiError(400, msg);
export const notFound = (msg = "Not found") => new ApiError(404, msg);
export const tooMany = (msg = "Too many requests") => new ApiError(429, msg);

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

/** Normalize any thrown value into a JSON error response. */
export function handleError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const msg = first ? `${first.path.join(".") || "input"}: ${first.message}` : "Validation failed";
    return NextResponse.json({ ok: false, error: msg, issues: err.issues }, { status: 400 });
  }
  // Duplicate key (e.g. email already registered)
  if (typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 11000) {
    return NextResponse.json({ ok: false, error: "That email is already registered." }, { status: 409 });
  }
  console.error("[api] Unhandled error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
