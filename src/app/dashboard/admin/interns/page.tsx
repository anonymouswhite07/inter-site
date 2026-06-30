import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Users, Mail, Phone, MapPin, Shield, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

export const metadata = {
  title: "Manage Interns — Simply Updify",
};

export default async function AdminInternsPage() {
  const db = await getDb();
  
  // Fetch all interns
  const interns = await db
    .collection(COLLECTIONS.USERS)
    .find({ role: "INTERN" })
    .toArray();

  const userIds = interns.map((i) => i._id.toString());
  
  // Fetch their profiles
  const profiles = await db
    .collection(COLLECTIONS.PROFILES)
    .find({ userId: { $in: userIds } })
    .toArray();

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Intern Directory</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Oversee all registered company interns, tracks, and contact records.
        </p>
      </div>

      <div className="fluent-card p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Domain</th>
                <th className="py-2 font-medium">Contact</th>
                <th className="py-2 font-medium">College / University</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {interns.map((intern) => {
                const profile = profiles.find((p) => p.userId === intern._id.toString());
                return (
                  <tr key={intern._id.toString()} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                    <td className="py-2.5 flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-semibold">
                          {getInitials(intern.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{intern.name}</span>
                    </td>
                    <td className="py-2.5">
                      <Badge variant="outline" className="rounded-sm text-[9px] h-4.5 px-1.5 font-medium">
                        {profile?.domain || "General"}
                      </Badge>
                    </td>
                    <td className="py-2.5 space-y-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {intern.email}
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {profile.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                      {profile?.college || "—"}
                    </td>
                    <td className="py-2.5">
                      <Badge className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 text-[9px] h-4.5 px-1.5 font-medium">
                        Active
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
