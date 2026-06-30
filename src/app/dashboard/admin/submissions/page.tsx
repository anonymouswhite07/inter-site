import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { FileCheck, Mail, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Submissions — Simply Updify",
};

export default async function AdminSubmissionsPage() {
  const db = await getDb();
  
  // Fetch all submissions
  const submissions = await db
    .collection(COLLECTIONS.SUBMISSIONS)
    .find({})
    .sort({ submittedAt: -1 })
    .toArray();

  const taskIds = submissions.map((s) => s.taskId);
  const internIds = submissions.map((s) => s.internId);

  const tasks = await db.collection(COLLECTIONS.TASKS).find({
    _id: { $in: taskIds.map((id) => { try { return new Object(id); } catch { return id; } }) }
  }).toArray();

  const interns = await db.collection(COLLECTIONS.USERS).find({
    _id: { $in: internIds.map((id) => { try { return new Object(id); } catch { return id; } }) }
  }).toArray();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 text-[9px] h-4.5 px-1.5 font-medium">Approved</Badge>;
      case "REJECTED":
        return <Badge className="rounded-sm bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 text-[9px] h-4.5 px-1.5 font-medium">Rejected</Badge>;
      case "RETURNED":
        return <Badge className="rounded-sm bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 text-[9px] h-4.5 px-1.5 font-medium">Returned</Badge>;
      default:
        return <Badge className="rounded-sm bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 text-[9px] h-4.5 px-1.5 font-medium">Submitted</Badge>;
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Student Submissions</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Review all submitted sprint deliverables and evaluation scores.
        </p>
      </div>

      <div className="fluent-card p-4">
        {submissions.length === 0 ? (
          <div className="py-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No submissions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                  <th className="py-2 font-medium">Intern</th>
                  <th className="py-2 font-medium">Task Ticket</th>
                  <th className="py-2 font-medium">Links</th>
                  <th className="py-2 font-medium">Submitted At</th>
                  <th className="py-2 font-medium">Score</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {submissions.map((sub) => {
                  const task = tasks.find((t) => t._id.toString() === sub.taskId);
                  const intern = interns.find((i) => i._id.toString() === sub.internId);

                  return (
                    <tr key={sub._id.toString()} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                      <td className="py-2.5 font-medium">{intern?.name || "Unknown"}</td>
                      <td className="py-2.5 text-[hsl(var(--muted-foreground))]">{task?.title || "Unknown Task"}</td>
                      <td className="py-2.5 space-y-0.5 text-[11px]">
                        {sub.githubUrl && (
                          <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[hsl(var(--primary))] hover:underline">
                            Repository <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                      <td className="py-2.5 text-[hsl(var(--muted-foreground))]">
                        {sub.submittedAt ? formatDate(sub.submittedAt) : "—"}
                      </td>
                      <td className="py-2.5 font-semibold text-[hsl(var(--foreground))]">
                        {sub.score !== null && sub.score !== undefined ? `${sub.score}/100` : "—"}
                      </td>
                      <td className="py-2.5">{getStatusBadge(sub.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
