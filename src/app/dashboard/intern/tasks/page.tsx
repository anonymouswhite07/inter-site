import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { TaskListClient } from "./TaskListClient";
import type { Task, Submission } from "@/types";
import { ObjectId } from "mongodb";

export const metadata = {
  title: "My Tasks — Simply Updify",
};

export default async function InternTasksPage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();

  // 1. Get the intern's profile to find their domain
  const profile = (await db.collection("Profile").findOne({ userId: new ObjectId(session.user.id) })
    || await db.collection("profiles").findOne({ userId: new ObjectId(session.user.id) })
    || {}) as any;

  const userDomain = profile.domain || "Fullstack Development";

  // 2. Fetch all tasks matching their domain (or general tasks)
  const tasksCursor = await db.collection(COLLECTIONS.TASKS).find({
    $or: [
      { domain: userDomain },
      { domain: "All Domains" },
      { domain: { $exists: false } },
      { domain: "" }
    ]
  }).sort({ deadline: 1 });
  
  const rawTasks = await tasksCursor.toArray();

  // Map Mongo objects to clean serializable types
  const tasks: Task[] = rawTasks.map((t) => ({
    _id: t._id.toString(),
    title: t.title,
    description: t.description,
    difficulty: t.difficulty,
    status: t.status,
    priority: t.priority,
    xpReward: t.xpReward,
    deadline: t.deadline,
    estimatedHours: t.estimatedHours,
    requiresGithub: t.requiresGithub,
    requiresLiveDemo: t.requiresLiveDemo,
    attachments: t.attachments || [],
    resources: t.resources || [],
    isRecurring: t.isRecurring || false,
    createdBy: t.createdBy,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  // 3. Fetch the intern's existing submissions for these tasks
  const submissionsCursor = await db.collection(COLLECTIONS.SUBMISSIONS).find({
    internId: session.user.id,
  });
  const rawSubmissions = await submissionsCursor.toArray();

  const submissions: Submission[] = rawSubmissions.map((s) => ({
    _id: s._id.toString(),
    taskId: s.taskId,
    internId: s.internId,
    status: s.status,
    githubUrl: s.githubUrl,
    liveUrl: s.liveUrl,
    files: s.files || [],
    images: s.images || [],
    notes: s.notes,
    score: s.score,
    reviewedBy: s.reviewedBy,
    reviewedAt: s.reviewedAt,
    reviewComment: s.reviewComment,
    isDraft: s.isDraft || false,
    submittedAt: s.submittedAt,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sprint Backlog</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Review your assigned tickets, track deadlines, and submit your deliverables.
        </p>
      </div>

      <TaskListClient tasks={tasks} submissions={submissions} />
    </div>
  );
}
