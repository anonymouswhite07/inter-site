import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  xpReward: z.number().min(10).max(1000),
  deadline: z.string().min(1),
  estimatedHours: z.number().min(1),
  domain: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limit check
    const limitRes = await rateLimit(`task_create_${session.user.id}`, { limit: 20, windowMs: 3600000 });
    if (!limitRes.success) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = taskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid inputs." },
        { status: 400 }
      );
    }

    const { title, description, difficulty, xpReward, deadline, estimatedHours, domain } = result.data;
    const db = await getDb();
    const now = new Date();

    await db.collection(COLLECTIONS.TASKS).insertOne({
      title,
      description,
      difficulty,
      status: "PUBLISHED",
      priority: "MEDIUM",
      xpReward,
      deadline: new Date(deadline),
      estimatedHours,
      domain: domain || "All Domains",
      attachments: [],
      resources: [],
      requiresGithub: true,
      requiresLiveDemo: false,
      isRecurring: false,
      createdBy: session.user.id,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Task ticket created successfully.",
    });
  } catch (error) {
    console.error("Task creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
