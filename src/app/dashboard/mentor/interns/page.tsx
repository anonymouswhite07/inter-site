import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Users, Mail, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getInitials } from "@/lib/utils";

export const metadata = {
  title: "My Interns — Simply Updify",
};

export default async function MentorInternsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();
  
  // Fetch all interns
  const interns = await db
    .collection(COLLECTIONS.USERS)
    .find({ role: "INTERN" })
    .toArray();

  const userIds = interns.map((i) => i._id.toString());
  
  // Fetch profiles
  const profiles = await db
    .collection(COLLECTIONS.PROFILES)
    .find({ userId: { $in: userIds } })
    .toArray();

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Assigned Cohort</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Monitor your students&apos; progress, deliverables, and total XP standing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interns.map((intern) => {
          const profile = profiles.find((p) => p.userId === intern._id.toString());
          return (
            <div key={intern._id.toString()} className="fluent-card p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-semibold">
                    {getInitials(intern.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xs font-semibold">{intern.name}</h3>
                  <Badge variant="outline" className="rounded-sm text-[8px] h-3.5 px-1.5 mt-1 font-medium uppercase">
                    {profile?.domain || "General"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                  <span>{intern.email}</span>
                </div>
              </div>

              <div className="border-t border-[hsl(var(--border))] pt-3 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[hsl(var(--muted-foreground))]">Sprint Accomplishment</span>
                  <span className="font-semibold">65%</span>
                </div>
                <Progress value={65} className="h-1 bg-[hsl(var(--muted))]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
