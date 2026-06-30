import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { CalendarCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Intern Attendance — Simply Updify",
};

export default async function AdminAttendancePage() {
  const db = await getDb();
  
  // Fetch all attendance logs
  const logs = await db
    .collection(COLLECTIONS.ATTENDANCE)
    .find({})
    .sort({ date: -1 })
    .toArray();

  const internIds = logs.map((l) => l.internId);
  const interns = await db.collection(COLLECTIONS.USERS).find({
    _id: { $in: internIds.map((id) => { try { return new Object(id); } catch { return id; } }) }
  }).toArray();

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Timecards & Attendance</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Monitor daily clock-in times and total hours logged across all cohorts.
        </p>
      </div>

      <div className="fluent-card p-4">
        {logs.length === 0 ? (
          <div className="py-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No attendance records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                  <th className="py-2 font-medium">Intern</th>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Clock In</th>
                  <th className="py-2 font-medium">Clock Out</th>
                  <th className="py-2 font-medium">Hours</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {logs.map((row) => {
                  const intern = interns.find((i) => i._id.toString() === row.internId);
                  return (
                    <tr key={row._id.toString()} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                      <td className="py-2.5 font-medium">{intern?.name || "Unknown"}</td>
                      <td className="py-2.5 text-[hsl(var(--muted-foreground))]">{formatDate(row.date)}</td>
                      <td className="py-2.5 text-[hsl(var(--muted-foreground))]">
                        {row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-2.5 text-[hsl(var(--muted-foreground))]">
                        {row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-2.5 font-medium">{row.hoursWorked ? `${row.hoursWorked}h` : "—"}</td>
                      <td className="py-2.5">
                        <Badge className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 text-[9px] h-4.5 px-1.5 font-medium">
                          {row.status}
                        </Badge>
                      </td>
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
