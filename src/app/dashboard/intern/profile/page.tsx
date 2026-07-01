"use client";

import { useSession } from "next-auth/react";
import { UserProfileDossier } from "@/components/dashboard/UserProfileDossier";

export default function InternProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
        <p>Loading session credentials...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="py-20 text-center text-xs text-[hsl(var(--muted-foreground))]">
        Please sign in to view your profile dossier.
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[800px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Manage your personal details, education credentials, and verify documents.
        </p>
      </div>

      <UserProfileDossier userId={session.user.id} />
    </div>
  );
}
