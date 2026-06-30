import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { AttendanceClient } from "./AttendanceClient";
import type { Attendance, LeaveRequest } from "@/types";

export const metadata = {
  title: "My Attendance — Simply Updify",
};

export default async function InternAttendancePage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();

  // 1. Fetch attendance records
  const attendanceCursor = await db.collection(COLLECTIONS.ATTENDANCE).find({
    internId: session.user.id,
  }).sort({ date: -1 });
  const rawAttendance = await attendanceCursor.toArray();

  const attendance: Attendance[] = rawAttendance.map((a) => ({
    _id: a._id.toString(),
    internId: a.internId,
    date: a.date,
    status: a.status,
    checkInTime: a.checkInTime,
    checkOutTime: a.checkOutTime,
    hoursWorked: a.hoursWorked || 0,
    notes: a.notes || "",
  }));

  // 2. Fetch leave requests
  const leavesCursor = await db.collection(COLLECTIONS.LEAVE_REQUESTS).find({
    internId: session.user.id,
  }).sort({ createdAt: -1 });
  const rawLeaves = await leavesCursor.toArray();

  const leaves: LeaveRequest[] = rawLeaves.map((l) => ({
    _id: l._id.toString(),
    internId: l.internId,
    startDate: l.startDate,
    endDate: l.endDate,
    reason: l.reason,
    status: l.status,
    approvedBy: l.approvedBy,
    approvedAt: l.approvedAt,
    createdAt: l.createdAt,
  }));

  // Check if today has an active clock-in
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayRecord = attendance.find(
    (a) => new Date(a.date) >= startOfDay && new Date(a.date) < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  );

  const isClockedIn = !!(todayRecord && !todayRecord.checkOutTime);
  const isClockedOut = !!(todayRecord && todayRecord.checkOutTime);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Time & Attendance</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Clock in for your shift, log your hours, and manage leave requests.
        </p>
      </div>

      <AttendanceClient
        attendance={attendance}
        leaves={leaves}
        isClockedIn={isClockedIn}
        isClockedOut={isClockedOut}
      />
    </div>
  );
}
