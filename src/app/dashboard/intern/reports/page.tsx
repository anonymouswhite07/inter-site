import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { DailyReportsClient } from "./DailyReportsClient";
import type { DailyReport } from "@/types";

export const metadata = {
  title: "Daily Reports — Simply Updify",
};

export default async function InternReportsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();

  // Fetch previous daily reports
  const reportsCursor = await db.collection(COLLECTIONS.DAILY_REPORTS).find({
    internId: session.user.id,
  }).sort({ date: -1 });
  const rawReports = await reportsCursor.toArray();

  const reports: DailyReport[] = rawReports.map((r) => ({
    _id: r._id.toString(),
    internId: r.internId,
    date: r.date,
    todaysWork: r.todaysWork,
    hoursWorked: r.hoursWorked,
    challenges: r.challenges || "",
    tomorrowGoals: r.tomorrowGoals || "",
    mentorFeedback: r.mentorFeedback || "",
    createdAt: r.createdAt,
  }));

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Daily Standup Reports</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Log your daily accomplishments, progress, and goals.
        </p>
      </div>

      <DailyReportsClient reports={reports} />
    </div>
  );
}
