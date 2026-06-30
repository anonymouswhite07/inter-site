import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { User, Mail, Shield, BookOpen, Link as LinkIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

export const metadata = {
  title: "My Profile — Simply Updify",
};

export default async function InternProfilePage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();
  
  // Fetch user and profile
  const user = await db.collection(COLLECTIONS.USERS).findOne({
    _id: new ObjectId(session.user.id)
  });

  const profile = await db.collection(COLLECTIONS.PROFILES).findOne({
    userId: session.user.id,
  });

  return (
    <div className="space-y-5 max-w-[800px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Manage your personal details, education credentials, and social links.
        </p>
      </div>

      <div className="fluent-card p-5 space-y-6 bg-[hsl(var(--card))]">
        {/* Header Profile Info */}
        <div className="flex items-center gap-4 border-b pb-5 border-[hsl(var(--border))]">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-lg font-semibold">
              {getInitials(session.user.name || "User")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold">{session.user.name}</h2>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
              Role: <span className="font-semibold">{session.user.role}</span>
            </p>
            <Badge variant="outline" className="rounded-sm text-[8px] h-4 px-1.5 mt-2 uppercase tracking-wider">
              {profile?.domain || "General"}
            </Badge>
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Email Address</span>
            <div className="flex items-center gap-2 p-2 rounded border bg-[hsl(var(--background))]">
              <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span>{session.user.email}</span>
            </div>
          </div>

          {profile?.phone && (
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Phone Number</span>
              <div className="flex items-center gap-2 p-2 rounded border bg-[hsl(var(--background))]">
                <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <span>{profile.phone}</span>
              </div>
            </div>
          )}

          {profile?.college && (
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">College / University</span>
              <div className="flex items-center gap-2 p-2 rounded border bg-[hsl(var(--background))]">
                <BookOpen className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <span>{profile.college}</span>
              </div>
            </div>
          )}

          {profile?.education && (
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Degree & Year</span>
              <div className="flex items-center gap-2 p-2 rounded border bg-[hsl(var(--background))]">
                <BookOpen className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <span>{profile.education}</span>
              </div>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="border-t pt-5 border-[hsl(var(--border))] space-y-3">
          <h3 className="text-xs font-semibold">Social Links</h3>
          <div className="grid gap-3 sm:grid-cols-3 text-xs text-[hsl(var(--muted-foreground))]">
            {profile?.github && (
              <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded border hover:bg-[hsl(var(--accent))] transition-colors">
                <LinkIcon className="h-4 w-4" />
                <span>GitHub Profile</span>
              </a>
            )}
            {profile?.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded border hover:bg-[hsl(var(--accent))] transition-colors">
                <LinkIcon className="h-4 w-4" />
                <span>LinkedIn Profile</span>
              </a>
            )}
            {profile?.portfolio && (
              <a href={profile.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded border hover:bg-[hsl(var(--accent))] transition-colors">
                <LinkIcon className="h-4 w-4" />
                <span>Portfolio Website</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// Helper to resolve MongoDB ObjectId instances inside Server Components
import { ObjectId } from "mongodb";
