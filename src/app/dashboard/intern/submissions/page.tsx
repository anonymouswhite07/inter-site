import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { FileCheck, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "My Submissions — Simply Updify",
};

export default async function InternSubmissionsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();

  // Fetch submissions
  const submissions = await db
    .collection(COLLECTIONS.SUBMISSIONS)
    .find({ internId: session.user.id })
    .sort({ submittedAt: -1 })
    .toArray();

  const taskIds = submissions.map((s) => s.taskId);
  const tasks = await db.collection(COLLECTIONS.TASKS).find({
    _id: { $in: taskIds.map((id) => { try { return new Object(id); } catch { return id; } }) }
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
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Submissions</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Track the review status and evaluation scores of all your submitted task tickets.
        </p>
      </div>

      <div className="fluent-card p-4">
        {submissions.length === 0 ? (
          <div className="py-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
            You haven&apos;t submitted any tasks yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                  <th className="py-2 font-medium">Task Ticket</th>
                  <th className="py-2 font-medium">Repository Link</th>
                  <th className="py-2 font-medium">Submitted At</th>
                  <th className="py-2 font-medium">Score</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {submissions.map((sub) => {
                  const task = tasks.find((t) => t._id.toString() === sub.taskId);
                  return (
                    <tr key={sub._id.toString()} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                      <td className="py-2.5 font-medium">{task?.title || "Unknown Task"}</td>
                      <td className="py-2.5">
                        {sub.githubUrl ? (
                          <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[hsl(var(--primary))] hover:underline">
                            View Code <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          "—"
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
// Helper to resolve MongoDB ObjectId instances inside Server Components
import { ObjectId } from "mongodb";
