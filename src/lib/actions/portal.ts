"use server";

import { revalidatePath } from "next/cache";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import type { SubmissionStatus, AttendanceStatus } from "@/types";

/* ─── Helper: Get Current Authenticated User ─── */
async function getSessionUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  ATTENDANCE ACTIONS                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

export async function clockInAction(notes?: string) {
  try {
    const user = await getSessionUser();
    const db = await getDb();
    const now = new Date();
    
    // Normalize date to start of day for uniqueness check
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const existing = await db.collection(COLLECTIONS.ATTENDANCE).findOne({
      internId: user.id,
      date: {
        $gte: startOfDay,
        $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existing) {
      return { success: false, error: "Already clocked in today." };
    }

    await db.collection(COLLECTIONS.ATTENDANCE).insertOne({
      internId: user.id,
      date: now,
      status: "PRESENT" as AttendanceStatus,
      checkInTime: now,
      checkOutTime: null,
      hoursWorked: 0,
      notes: notes || "Clocked in via portal",
    });

    // Award XP for consistency
    await db.collection(COLLECTIONS.XP_TRANSACTIONS).insertOne({
      internId: user.id,
      amount: 10,
      reason: "Daily clock-in bonus",
      taskId: null,
      createdAt: now,
    });

    revalidatePath("/dashboard/intern");
    return { success: true, message: "Clocked in successfully. +10 XP awarded!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to clock in" };
  }
}

export async function clockOutAction() {
  try {
    const user = await getSessionUser();
    const db = await getDb();
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendance = await db.collection(COLLECTIONS.ATTENDANCE).findOne({
      internId: user.id,
      date: {
        $gte: startOfDay,
        $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!attendance) {
      return { success: false, error: "No active clock-in session found for today." };
    }

    if (attendance.checkOutTime) {
      return { success: false, error: "Already clocked out today." };
    }

    const checkIn = new Date(attendance.checkInTime);
    const hoursWorked = Math.round(((now.getTime() - checkIn.getTime()) / 3600000) * 10) / 10;

    await db.collection(COLLECTIONS.ATTENDANCE).updateOne(
      { _id: attendance._id },
      {
        $set: {
          checkOutTime: now,
          hoursWorked: hoursWorked,
        }
      }
    );

    revalidatePath("/dashboard/intern");
    return { success: true, message: `Clocked out successfully. Hours logged: ${hoursWorked}` };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to clock out" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TASK & SUBMISSION ACTIONS                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

export async function submitTaskAction(formData: {
  taskId: string;
  githubUrl?: string;
  liveUrl?: string;
  notes?: string;
}) {
  try {
    const user = await getSessionUser();
    const db = await getDb();
    const now = new Date();

    const task = await db.collection(COLLECTIONS.TASKS).findOne({ _id: new ObjectId(formData.taskId) });
    if (!task) {
      return { success: false, error: "Task not found." };
    }

    const submission = {
      taskId: formData.taskId,
      internId: user.id,
      status: "SUBMITTED" as SubmissionStatus,
      githubUrl: formData.githubUrl || null,
      liveUrl: formData.liveUrl || null,
      files: [],
      images: [],
      notes: formData.notes || null,
      isDraft: false,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Upsert submission
    await db.collection(COLLECTIONS.SUBMISSIONS).updateOne(
      { taskId: formData.taskId, internId: user.id },
      { $set: submission },
      { upsert: true }
    );

    revalidatePath("/dashboard/intern");
    return { success: true, message: "Task ticket submitted successfully for review." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit task" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MENTOR EVALUATION ACTIONS                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

export async function submitReviewAction(data: {
  submissionId: string;
  status: "APPROVED" | "REJECTED" | "RETURNED";
  score: number;
  comment: string;
}) {
  try {
    const user = await getSessionUser();
    const db = await getDb();
    const now = new Date();

    const submission = await db.collection(COLLECTIONS.SUBMISSIONS).findOne({
      _id: new ObjectId(data.submissionId)
    });

    if (!submission) {
      return { success: false, error: "Submission not found." };
    }

    // Update submission status
    await db.collection(COLLECTIONS.SUBMISSIONS).updateOne(
      { _id: new ObjectId(data.submissionId) },
      {
        $set: {
          status: data.status,
          score: data.score,
          reviewedBy: user.id,
          reviewedAt: now,
          reviewComment: data.comment,
          updatedAt: now,
        }
      }
    );

    // If approved, award the task's XP to the intern
    if (data.status === "APPROVED") {
      const task = await db.collection(COLLECTIONS.TASKS).findOne({
        _id: new ObjectId(submission.taskId)
      });
      
      if (task) {
        await db.collection(COLLECTIONS.XP_TRANSACTIONS).insertOne({
          internId: submission.internId,
          amount: task.xpReward || 100,
          reason: `Sprint Task Completed: ${task.title}`,
          taskId: submission.taskId,
          createdAt: now,
        });
      }
    }

    revalidatePath("/dashboard/mentor");
    return { success: true, message: `Submission reviewed successfully. Status updated to ${data.status}.` };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit review" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  DAILY PROGRESS REPORT ACTIONS                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */

export async function submitDailyReportAction(data: {
  todaysWork: string;
  hoursWorked: number;
  challenges?: string;
  tomorrowGoals?: string;
}) {
  try {
    const user = await getSessionUser();
    const db = await getDb();
    const now = new Date();

    await db.collection(COLLECTIONS.DAILY_REPORTS).insertOne({
      internId: user.id,
      date: now,
      todaysWork: data.todaysWork,
      hoursWorked: Number(data.hoursWorked),
      challenges: data.challenges || null,
      tomorrowGoals: data.tomorrowGoals || null,
      mentorFeedback: null,
      createdAt: now,
    });

    // Award 5 XP for completing daily standup report
    await db.collection(COLLECTIONS.XP_TRANSACTIONS).insertOne({
      internId: user.id,
      amount: 5,
      reason: "Daily standup report submitted",
      taskId: null,
      createdAt: now,
    });

    revalidatePath("/dashboard/intern");
    return { success: true, message: "Daily report submitted. +5 XP awarded." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit report" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CERTIFICATE & ANNOUNCEMENT ACTIONS                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */

export async function issueCertificateAction(internId: string) {
  try {
    const caller = await getSessionUser();
    if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const db = await getDb();
    
    // Check if certificate already exists
    const existing = await db.collection(COLLECTIONS.CERTIFICATES).findOne({ internId });
    if (existing) {
      return { success: false, error: "Certificate already issued for this intern." };
    }

    // Fetch intern details
    const intern = await db.collection(COLLECTIONS.USERS).findOne({
      _id: new ObjectId(internId),
      role: "INTERN"
    });
    if (!intern) {
      return { success: false, error: "Intern not found." };
    }

    const profile = await db.collection(COLLECTIONS.PROFILES).findOne({ userId: internId });
    const domain = profile?.domain || "Software Engineering";

    // Generate a unique Certificate ID
    const uniqueId = `SU-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const now = new Date();
    await db.collection(COLLECTIONS.CERTIFICATES).insertOne({
      certificateId: uniqueId,
      internId,
      internName: intern.name,
      domain,
      issueDate: now,
      pdfUrl: null,
      createdAt: now,
    });

    revalidatePath("/dashboard/admin/certificates");
    revalidatePath("/dashboard/intern/certificates");
    return { success: true, message: `Certificate ${uniqueId} issued successfully.` };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to issue certificate" };
  }
}

export async function publishAnnouncementAction(data: {
  title: string;
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}) {
  try {
    const caller = await getSessionUser();
    if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const db = await getDb();
    const now = new Date();

    await db.collection(COLLECTIONS.ANNOUNCEMENTS).insertOne({
      title: data.title,
      content: data.content,
      priority: data.priority,
      publishedAt: now,
      createdBy: caller.id,
      createdAt: now,
    });

    revalidatePath("/dashboard/admin/announcements");
    revalidatePath("/dashboard/intern");
    return { success: true, message: "Announcement published successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to publish announcement" };
  }
}

export async function createBatchAction(data: {
  name: string;
  slug: string;
  domain: string;
  startDate: string;
  endDate: string;
  maxInterns: number;
  description?: string;
}) {
  try {
    const caller = await getSessionUser();
    if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const db = await getDb();
    const now = new Date();

    // Check if slug is unique
    const existing = await db.collection(COLLECTIONS.BATCHES).findOne({ slug: data.slug });
    if (existing) {
      return { success: false, error: "A batch with this slug already exists." };
    }

    await db.collection(COLLECTIONS.BATCHES).insertOne({
      name: data.name,
      slug: data.slug,
      domain: data.domain,
      description: data.description || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      maxInterns: Number(data.maxInterns),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/dashboard/admin/batches");
    return { success: true, message: `Batch ${data.name} created successfully.` };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create batch" };
  }
}
