import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validation";
import { comparePassword, signToken, setAuthCookie, toPublicUser } from "@/lib/auth";
import { ok, handleError, unauthorized } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    rateLimit(req, "login", 15);
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    await connectDB();
    // password has select:false — request it explicitly.
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) throw unauthorized("Invalid email or password.");

    const valid = await comparePassword(password, user.password);
    if (!valid) throw unauthorized("Invalid email or password.");

    const token = signToken({ sub: String(user._id), email: user.email });
    await setAuthCookie(token);

    return ok({ user: toPublicUser(user) });
  } catch (err) {
    return handleError(err);
  }
}
