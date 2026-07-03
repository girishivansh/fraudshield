import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "./db";
import { User, type UserDoc } from "@/models/User";
import { unauthorized } from "./api";

/* ============================================================
   Authentication: bcrypt password hashing, JWT issuing, and
   secure httpOnly session cookies. getCurrentUser() reads the
   cookie, verifies the JWT, and loads the user from Mongo.
   ============================================================ */

const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
const COOKIE_NAME = "fs_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type JwtPayload = { sub: string; email: string };

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  initials: string;
  createdAt: string;
};

export function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "FS"
  );
}

export function toPublicUser(u: UserDoc): PublicUser {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    company: u.company ?? "",
    initials: initialsOf(u.name),
    createdAt: (u as unknown as { createdAt?: Date }).createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

/** Write the session cookie (secure, httpOnly). */
export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Load the currently authenticated user, or null. */
export async function getCurrentUser(): Promise<UserDoc | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.sub);
  return user;
}

/** Like getCurrentUser but throws 401 when unauthenticated. */
export async function requireUser(): Promise<UserDoc> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}
