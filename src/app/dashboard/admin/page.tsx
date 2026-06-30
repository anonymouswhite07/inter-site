import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Admin Dashboard — Simply Updify",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();

  // 1. Fetch real-time count metrics
  const totalInterns = await db.collection(COLLECTIONS.USERS).countDocuments({ role: "INTERN" });
  const activeMentors = await db.collection(COLLECTIONS.USERS).countDocuments({ role: "MENTOR" });
  const totalTasks = await db.collection(COLLECTIONS.TASKS).countDocuments();
  const pendingReviews = await db.collection(COLLECTIONS.SUBMISSIONS).countDocuments({ status: "SUBMITTED" });

  // 2. Aggregate XP Awarded
  const xpAggregation = await db.collection(COLLECTIONS.XP_TRANSACTIONS).aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      }
    }
  ]).toArray();
  const totalXp = xpAggregation[0]?.total || 0;

  // 3. Fetch top 3 pending submissions
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

  const interns = await db.collection(COLLECTIONS.USERS).find({
    _id: { $in: internIds.map((id) => { try { return new Object(id); } catch { return id; } }) }
  }).toArray();

  const pendingReviewsList = pendingSubmissions.map((sub) => {
    const task = tasks.find((t) => t._id.toString() === sub.taskId);
    const intern = interns.find((i) => i._id.toString() === sub.internId);

    return {
      id: sub._id.toString(),
      internName: intern?.name || "Unknown Intern",
      taskTitle: task?.title || "Unknown Task",
      domain: task?.domain || "General",
      submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "—",
      difficulty: task?.difficulty || "Medium",
    };
  });

  return (
    <AdminDashboardClient
      stats={{
        totalInterns,
        activeMentors,
        totalTasks,
        pendingReviews,
        totalXp,
      }}
      pendingReviewsList={pendingReviewsList}
    />
  );
}
