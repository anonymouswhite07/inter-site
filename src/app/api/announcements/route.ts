import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    // Fetch the 5 most recent announcements
    const announcements = await db
      .collection(COLLECTIONS.ANNOUNCEMENTS)
      .find({})
      .sort({ publishedAt: -1 })
      .limit(5)
      .toArray();

    const formatted = announcements.map((ann) => ({
      id: ann._id.toString(),
      title: ann.title,
      content: ann.content,
      priority: ann.priority,
      publishedAt: ann.publishedAt || ann.createdAt,
    }));

    return NextResponse.json({ success: true, announcements: formatted });
  } catch (error: any) {
    console.error("Failed to load announcements for notification bell:", error);
    return NextResponse.json({ success: false, error: "Failed to load notifications" }, { status: 500 });
  }
}
