import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { MentorDashboardClient } from "./MentorDashboardClient";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Mentor Dashboard — Simply Updify",
};

export default async function MentorDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();

  // 1. Fetch all interns (Assigned Cohort)
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

  // Fetch XP totals for each intern
  const xpAggregation = await db.collection(COLLECTIONS.XP_TRANSACTIONS).aggregate([
    {
      $group: {
        _id: "$internId",
        total: { $sum: "$amount" },
      }
    }
  ]).toArray();

  const assignedInterns = interns.map((intern) => {
    const profile = profiles.find((p) => p.userId === intern._id.toString());
    const xpRecord = xpAggregation.find((x) => x._id === intern._id.toString());
    return {
      id: intern._id.toString(),
      name: intern.name,
      domain: profile?.domain || "General",
      progress: 65, // Static fallback or simple math
      xp: xpRecord?.total || 0,
    };
  });

  // 2. Fetch pending reviews count
  const pendingCount = await db.collection(COLLECTIONS.SUBMISSIONS).countDocuments({
    status: "SUBMITTED",
  });

  // 3. Average grading score
  const scoreAggregation = await db.collection(COLLECTIONS.SUBMISSIONS).aggregate([
    {
      $match: { score: { $ne: null } }
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$score" },
      }
    }
  ]).toArray();
  const avgScore = scoreAggregation[0]?.avg || 0;

  // 4. Active Tasks
  const activeTasks = await db.collection(COLLECTIONS.TASKS).countDocuments({});

  // 5. Fetch top 3 pending reviews
  const pendingSubmissions = await db
    .collection(COLLECTIONS.SUBMISSIONS)
    .find({ status: "SUBMITTED" })
    .sort({ submittedAt: 1 })
    .limit(3)
    .toArray();

  const taskIds = pendingSubmissions.map((s) => s.taskId);
  const internIds = pendingSubmissions.map((s) => s.internId);

  const tasks = await db.collection(COLLECTIONS.TASKS).find({
    _id: { $in: taskIds.map((id) => { try { return new Object(id); } catch { return id; } }) }
  }).toArray();

  const users = await db.collection(COLLECTIONS.USERS).find({
    _id: { $in: internIds.map((id) => { try { return new Object(id); } catch { return id; } }) }
  }).toArray();

  const pendingReviews = pendingSubmissions.map((sub) => {
    const task = tasks.find((t) => t._id.toString() === sub.taskId);
    const user = users.find((u) => u._id.toString() === sub.internId);
    return {
      id: sub._id.toString(),
      internName: user?.name || "Unknown Intern",
      taskTitle: task?.title || "Unknown Task",
      submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "—",
    };
  });

  return (
    <MentorDashboardClient
      stats={{
        assignedCount: interns.length,
        pendingCount,
        avgScore,
        activeTasks,
      }}
      assignedInterns={assignedInterns}
      pendingReviews={pendingReviews}
    />
  );
}
