"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Redirecting to Secure Gate...</p>
      </div>
    </div>
  );
}
