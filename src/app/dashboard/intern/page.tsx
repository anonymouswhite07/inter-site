import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { InternDashboardClient } from "./InternDashboardClient";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const metadata = {
  title: "Intern Dashboard — Simply Updify",
};

export default async function InternDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();

  // 1. Fetch intern's profile
  const profile = await db.collection(COLLECTIONS.PROFILES).findOne({
    userId: session.user.id,
  });

  // 2. Fetch attendance logs to check today's status
  const attendanceCursor = await db.collection(COLLECTIONS.ATTENDANCE).find({
    internId: session.user.id,
  }).sort({ date: -1 });
  const attendance = await attendanceCursor.toArray();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayRecord = attendance.find(
    (a) => new Date(a.date) >= startOfDay && new Date(a.date) < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  );

  const isClockedIn = !!(todayRecord && !todayRecord.checkOutTime);
  const isClockedOut = !!(todayRecord && todayRecord.checkOutTime);

  // Calculate attendance rate (e.g. out of total days)
  const totalDaysPresent = attendance.length;
  const attendanceRate = totalDaysPresent > 0 ? 100 : 0; // Simple binary indicator or percentage

  // 3. Fetch completed tasks (Approved submissions)
  const approvedSubmissionsCount = await db.collection(COLLECTIONS.SUBMISSIONS).countDocuments({
    internId: session.user.id,
    status: "APPROVED",
  });

  // 4. Fetch total assigned tasks count
  const totalTasksCount = await db.collection(COLLECTIONS.TASKS).countDocuments({
    $or: [
      { domain: profile?.domain },
      { domain: { $exists: false } }
    ]
  });

  // 5. Fetch total XP
  const xpAggregation = await db.collection(COLLECTIONS.XP_TRANSACTIONS).aggregate([
    {
      $match: { internId: session.user.id }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      }
    }
  ]).toArray();
  const totalXp = xpAggregation[0]?.total || 0;

  // 6. Fetch recent assigned tasks
  const recentTasks = await db.collection(COLLECTIONS.TASKS).find({
    $or: [
      { domain: profile?.domain },
      { domain: { $exists: false } }
    ]
  }).sort({ deadline: 1 }).limit(3).toArray();

  // 7. Fetch announcements
  const announcements = await db.collection(COLLECTIONS.ANNOUNCEMENTS).find({}).sort({ publishedAt: -1 }).limit(3).toArray();
  const announcementsList = announcements.map((ann) => ({
    id: ann._id.toString(),
    title: ann.title,
    content: ann.content,
    priority: ann.priority,
  }));

  // 8. Fetch recent feedback (Evaluated submissions)
  const evaluatedSubmissions = await db.collection(COLLECTIONS.SUBMISSIONS).find({
    internId: session.user.id,
    status: { $in: ["APPROVED", "REJECTED", "RETURNED"] },
    reviewedAt: { $exists: true }
  }).sort({ reviewedAt: -1 }).limit(2).toArray();

  const taskIds = evaluatedSubmissions.map((s) => s.taskId);
  const tasks = await db.collection(COLLECTIONS.TASKS).find({
    _id: { $in: taskIds.map((id) => { try { return new Object(id); } catch { return id; } }) }
  }).toArray();

  const recentFeedback = evaluatedSubmissions.map((sub) => {
    const task = tasks.find((t) => t._id.toString() === sub.taskId);
    return {
      taskTitle: task?.title || "Task",
      score: sub.score,
      comment: sub.reviewComment || "No comment provided.",
    };
  });

  // 9. Weekly committed hours from attendance
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyProgress = days.map((dayName, idx) => {
    // Find hours worked on this day of the current week
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Sunday
    const targetDate = new Date(currentWeekStart);
    targetDate.setDate(targetDate.getDate() + idx);

    const record = attendance.find((a) => {
      const d = new Date(a.date);
      return d.getDate() === targetDate.getDate() && d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
    });

    return {
      day: dayName,
      hours: record?.hoursWorked || 0,
    };
  });

  return (
    <InternDashboardClient
      stats={{
        userName: session.user.name || "Intern",
        domain: profile?.domain || "General",
        totalXp,
        completedTasks: approvedSubmissionsCount,
        totalTasksCount,
        attendanceRate,
        streak: totalDaysPresent,
        isClockedIn,
        isClockedOut,
      }}
      recentTasks={recentTasks}
      announcementsList={announcementsList}
      recentFeedback={recentFeedback}
      weeklyProgress={weeklyProgress}
    />
  );
}
