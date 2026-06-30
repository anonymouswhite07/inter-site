import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Mail, Shield, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

export const metadata = {
  title: "Manage Mentors — Simply Updify",
};

export default async function AdminMentorsPage() {
  const db = await getDb();
  
  // Fetch all mentors
  const mentors = await db
    .collection(COLLECTIONS.USERS)
    .find({ role: "MENTOR" })
    .toArray();

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Lead Developers & Mentors</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Oversee all registered company mentors and engineering leads.
        </p>
      </div>

      <div className="fluent-card p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Email</th>
                <th className="py-2 font-medium">Role</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {mentors.map((mentor) => (
                <tr key={mentor._id.toString()} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                  <td className="py-2.5 flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-semibold">
                        {getInitials(mentor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{mentor.name}</span>
                  </td>
                  <td className="py-2.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {mentor.email}
                    </div>
                  </td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="rounded-sm text-[9px] h-4.5 px-1.5 font-medium">
                      Technical Lead
                    </Badge>
                  </td>
                  <td className="py-2.5">
                    <Badge className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 text-[9px] h-4.5 px-1.5 font-medium">
                      Active
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
