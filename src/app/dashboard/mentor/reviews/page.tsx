import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { ReviewListClient } from "./ReviewListClient";
import type { Submission, Task, User } from "@/types";

export const metadata = {
  title: "Sprint Reviews — Simply Updify",
};

export default async function MentorReviewsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();

  // 1. Fetch all pending submissions
  const submissionsCursor = await db.collection(COLLECTIONS.SUBMISSIONS).find({
    status: "SUBMITTED",
  }).sort({ submittedAt: 1 });
  const rawSubmissions = await submissionsCursor.toArray();

  // 2. Fetch tasks and user details for these submissions
  const taskIds = rawSubmissions.map((s) => s.taskId);
  const internIds = rawSubmissions.map((s) => s.internId);

  const tasks = await db.collection(COLLECTIONS.TASKS).find({
    _id: { $in: taskIds.map((id) => { try { return new Object(id); } catch { return id; } }) }
  }).toArray();

  const interns = await db.collection(COLLECTIONS.USERS).find({
    _id: { $in: internIds.map((id) => { try { return new Object(id); } catch { return id; } }) }
  }).toArray();

  // Map into serializable structures
  const submissionsData = rawSubmissions.map((s) => {
    const task = tasks.find((t) => t._id.toString() === s.taskId);
    const intern = interns.find((i) => i._id.toString() === s.internId);

    return {
      _id: s._id.toString(),
      taskId: s.taskId,
      internId: s.internId,
      status: s.status as Submission,
      githubUrl: s.githubUrl || null,
      liveUrl: s.liveUrl || null,
      notes: s.notes || "",
      submittedAt: s.submittedAt,
      internName: intern?.name || "Unknown Intern",
      taskTitle: task?.title || "Unknown Task",
      taskXp: task?.xpReward || 100,
    };
  });

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Review Backlog</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Evaluate submitted sprint tickets, assign scores, and issue completions.
        </p>
      </div>

      <ReviewListClient submissions={submissionsData} />
    </div>
  );
}
