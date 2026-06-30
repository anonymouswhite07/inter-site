import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const leaveSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limit check: Max 5 leave requests per hour
    const limitRes = await rateLimit(`leave_${session.user.id}`, { limit: 5, windowMs: 3600000 });
    if (!limitRes.success) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = leaveSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid inputs." },
        { status: 400 }
      );
    }

    const { startDate, endDate, reason } = result.data;
    const db = await getDb();
    const now = new Date();

    await db.collection(COLLECTIONS.LEAVE_REQUESTS).insertOne({
      internId: session.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "PENDING",
      approvedBy: null,
      approvedAt: null,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Leave request logged successfully.",
    });
  } catch (error) {
    console.error("Leave request error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
