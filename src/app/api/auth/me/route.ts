import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return ok({ user: user ? toPublicUser(user) : null });
  } catch (err) {
    return handleError(err);
  }
}
