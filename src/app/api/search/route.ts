import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const db = await getDb();
    const regex = new RegExp(query, "i");

    // 1. Search Tasks
    const tasks = await db
      .collection(COLLECTIONS.TASKS)
      .find({ title: { $regex: regex } })
      .limit(3)
      .toArray();

    // 2. Search Resources
    const resources = await db
      .collection(COLLECTIONS.RESOURCES)
      .find({ title: { $regex: regex } })
      .limit(3)
      .toArray();

    // 3. Search Interns (if admin or mentor)
    let interns: any[] = [];
    if (session.user.role !== "INTERN") {
      interns = await db
        .collection(COLLECTIONS.USERS)
        .find({ role: "INTERN", name: { $regex: regex } })
        .limit(3)
        .toArray();
    }

    const results = [
      ...tasks.map((t) => ({
        id: t._id.toString(),
        title: t.title,
        type: "Task",
        href: session.user.role === "INTERN" ? "/dashboard/intern/tasks" : "/dashboard/admin/tasks",
      })),
      ...resources.map((r) => ({
        id: r._id.toString(),
        title: r.title,
        type: "Resource",
        href: "/dashboard/resources",
      })),
      ...interns.map((i) => ({
        id: i._id.toString(),
        title: i.name,
        type: "Intern",
        href: session.user.role === "MENTOR" ? "/dashboard/mentor/interns" : "/dashboard/admin/interns",
      })),
    ];

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
