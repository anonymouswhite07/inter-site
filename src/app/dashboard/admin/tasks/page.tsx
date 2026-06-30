import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { ClipboardList, Plus, Clock, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Manage Tasks — Simply Updify",
};

export default async function AdminTasksPage() {
  const db = await getDb();
  
  // Fetch all tasks
  const tasks = await db
    .collection(COLLECTIONS.TASKS)
    .find({})
    .sort({ deadline: 1 })
    .toArray();

  const difficultyColor: Record<string, string> = {
    BEGINNER: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400",
    INTERMEDIATE: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400",
    ADVANCED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400",
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sprint Tasks</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Oversee and create task tickets for your intern cohorts.
          </p>
        </div>
        <Link href="/dashboard/admin/tasks/new">
          <Button size="sm" className="h-7 px-2.5 text-[11px] rounded bg-[hsl(var(--primary))] text-white font-medium">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Create Task
          </Button>
        </Link>
      </div>

      <div className="fluent-card p-4">
        {tasks.length === 0 ? (
          <div className="py-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No tasks created yet. Click &ldquo;Create Task&rdquo; to add your first sprint ticket.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                  <th className="py-2 font-medium">Task Ticket</th>
                  <th className="py-2 font-medium">Difficulty</th>
                  <th className="py-2 font-medium">Rewards</th>
                  <th className="py-2 font-medium">Deadline</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {tasks.map((task) => (
                  <tr key={task._id.toString()} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                    <td className="py-2.5 font-medium">
                      <div>{task.title}</div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))] font-normal mt-0.5 max-w-md truncate">
                        {task.description}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <Badge variant="outline" className={`rounded-sm text-[9px] h-4.5 px-1.5 font-medium ${difficultyColor[task.difficulty] || ""}`}>
                        {task.difficulty}
                      </Badge>
                    </td>
                    <td className="py-2.5 space-y-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                      <div className="flex items-center gap-1 font-semibold text-[hsl(var(--foreground))]">
                        <Zap className="h-3.5 w-3.5 text-amber-500" /> {task.xpReward} XP
                      </div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        Est: {task.estimatedHours} hrs
                      </div>
                    </td>
                    <td className="py-2.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                        <span>{formatDate(task.deadline)}</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <Badge className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 text-[9px] h-4.5 px-1.5 font-medium">
                        {task.status || "PUBLISHED"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
