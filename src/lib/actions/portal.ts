"use server";

import { revalidatePath } from "next/cache";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import type { SubmissionStatus, AttendanceStatus } from "@/types";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";
import { headers } from "next/headers";

/* ─── Helper: Get Current Authenticated User ─── */
async function getSessionUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function logAuditAction(action: string, resource: string) {
  try {
    const session = await auth();
    if (!session?.user) return;
    
    const db = await getDb();
    const reqHeaders = await headers();
    const ipAddress = reqHeaders.get("x-forwarded-for") || "127.0.0.1";
    
    await db.collection(COLLECTIONS.AUDIT_LOGS).insertOne({
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action,
      resource,
      ipAddress,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("Failed to log security audit record:", err);
  }
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

    await logAuditAction("CREATE_BATCH", `Batch: ${data.name} (${data.slug})`);

    revalidatePath("/dashboard/admin/batches");
    return { success: true, message: `Batch ${data.name} created successfully.` };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create batch" };
  }
}

export async function createUserAction(data: {
  name: string;
  email: string;
  role: "INTERN" | "MENTOR" | "ADMIN";
  domain?: string;
  mentorName?: string;
  duration?: string;
}) {
  try {
    const caller = await getSessionUser();
    if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const db = await getDb();
    const now = new Date();

    // Check if email already exists
    const existing = await db.collection(COLLECTIONS.USERS).findOne({ 
      email: data.email.toLowerCase() 
    });
    
    if (existing) {
      if (existing.deletedAt) {
        // Purge old soft-deleted records to permit onboarding a fresh profile
        await db.collection(COLLECTIONS.USERS).deleteOne({ _id: existing._id });
        await db.collection("Profile").deleteMany({ userId: existing._id });
        await db.collection("profiles").deleteMany({ userId: existing._id });
      } else {
        return { success: false, error: "A user with this email address already exists." };
      }
    }

    // Generate a temporary password (e.g. SU-XXXX)
    const tempPassword = "SU-" + Math.floor(100000 + Math.random() * 900000);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role,
      isActive: true,
      image: null,
      emailVerified: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    // Insert user
    const result = await db.collection(COLLECTIONS.USERS).insertOne(newUser);
    const newUserId = result.insertedId;

    // Generate matching Profile collection records with specified onboarding parameters
    const initialProfile = {
      userId: newUserId,
      domain: data.domain || "Fullstack Development",
      mentorName: data.mentorName || "Arun Krishnan (Lead Mentor)",
      duration: data.duration || "3 Months",
      startDate: now,
      endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // default 90 days
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("Profile").insertOne(initialProfile);
    await db.collection("profiles").insertOne(initialProfile);

    await logAuditAction("ONBOARD_USER", `User: ${data.name} (${data.email}) as ${data.role} [Track: ${data.domain || "Unassigned"}]`);

    // Send credentials via Resend
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const emailResult = await sendWelcomeEmail({
      to: data.email,
      name: data.name,
      role: data.role,
      passwordText: tempPassword,
      loginUrl,
    });

    revalidatePath("/dashboard/admin/interns");
    revalidatePath("/dashboard/admin/mentors");
    
    let successMessage = `User ${data.name} created successfully.`;
    if (emailResult.logged) {
      successMessage += " (Creds printed to server log due to missing keys)";
    } else if (!emailResult.success) {
      successMessage += " (User created, but welcome email dispatch failed)";
    } else {
      successMessage += " Credentials sent to their email.";
    }

    return { success: true, message: successMessage };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create user" };
  }
}

export async function createResourceAction(data: {
  title: string;
  description: string;
  type: "LINK" | "PDF" | "VIDEO";
  url: string;
  domain: string;
}) {
  try {
    const caller = await getSessionUser();
    if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN" && caller.role !== "MENTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const db = await getDb();
    const now = new Date();

    const newResource = {
      title: data.title,
      description: data.description,
      type: data.type,
      url: data.url,
      domain: data.domain,
      uploadedBy: caller.id,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(COLLECTIONS.RESOURCES).insertOne(newResource);
    
    await logAuditAction("POST_RESOURCE", `Resource: ${data.title} (${data.type})`);

    revalidatePath("/dashboard/resources");
    return { success: true, message: `Resource "${data.title}" posted successfully.` };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to post resource" };
  }
}

export async function deleteAnnouncementAction(id: string) {
  try {
    const caller = await getSessionUser();
    if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const db = await getDb();
    await db.collection(COLLECTIONS.ANNOUNCEMENTS).deleteOne({
      _id: new ObjectId(id),
    });

    await logAuditAction("DELETE_ANNOUNCEMENT", `Announcement ID: ${id}`);

    revalidatePath("/dashboard/admin/announcements");
    revalidatePath("/dashboard/intern"); // Trigger updates on intern dashboard
    return { success: true, message: "Announcement deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete announcement" };
  }
}

export async function deleteResourceAction(id: string) {
  try {
    const caller = await getSessionUser();
    if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const db = await getDb();
    await db.collection(COLLECTIONS.RESOURCES).deleteOne({
      _id: new ObjectId(id),
    });

    await logAuditAction("DELETE_RESOURCE", `Resource ID: ${id}`);

    revalidatePath("/dashboard/resources");
    return { success: true, message: "Resource deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete resource" };
  }
}

export async function getSettingsAction() {
  try {
    const db = await getDb();
    const settingsDoc = await db.collection(COLLECTIONS.SETTINGS).findOne({ key: "global_config" });
    if (settingsDoc) {
      return { success: true, settings: settingsDoc.value };
    }
    // Default system settings
    return {
      success: true,
      settings: {
        appName: "Simply Updify",
        allowedDomains: "*",
        senderEmail: "onboarding@resend.dev",
        maintenanceMode: false,
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load portal configuration" };
  }
}

export async function saveSettingsAction(settings: {
  appName: string;
  allowedDomains: string;
  senderEmail: string;
  maintenanceMode: boolean;
}) {
  try {
    const caller = await getSessionUser();
    if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const db = await getDb();
    await db.collection(COLLECTIONS.SETTINGS).updateOne(
      { key: "global_config" },
      { $set: { value: settings, updatedAt: new Date() } },
      { upsert: true }
    );

    await logAuditAction("UPDATE_SETTINGS", "System settings panel modified");

    return { success: true, message: "Global settings updated successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save settings" };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const caller = await getSessionUser();
    if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const db = await getDb();
    await db.collection(COLLECTIONS.USERS).updateOne(
      { _id: new ObjectId(userId) },
      { $set: { deletedAt: new Date(), isActive: false } }
    );

    await logAuditAction("DELETE_USER", `User ID: ${userId}`);

    revalidatePath("/dashboard/admin/interns");
    revalidatePath("/dashboard/admin/mentors");
    return { success: true, message: "User deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete user" };
  }
}


