import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validation";
import { hashPassword, signToken, setAuthCookie, toPublicUser } from "@/lib/auth";
import { ok, handleError, badRequest } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    rateLimit(req, "register", 10);
    const body = await req.json();
    const { name, email, password, company } = registerSchema.parse(body);

    await connectDB();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw badRequest("An account with that email already exists.");

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: await hashPassword(password),
      company: company ?? "",
    });

    const token = signToken({ sub: String(user._id), email: user.email });
    await setAuthCookie(token);

    return ok({ user: toPublicUser(user) }, 201);
  } catch (err) {
    return handleError(err);
  }
}
