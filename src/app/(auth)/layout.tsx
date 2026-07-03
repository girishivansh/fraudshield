import type { ReactNode } from "react";
import { SceneBackground } from "@/components/backgrounds/scene";
import { AuthAside } from "@/components/auth/auth-aside";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <SceneBackground variant="auth" particles={false} />
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left brand / intelligence panel */}
        <AuthAside />

        {/* Right: form area */}
        <main className="flex items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
