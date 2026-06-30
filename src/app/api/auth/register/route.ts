import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, COLLECTIONS } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, college, degree, domain, bio, github, linkedin, portfolio } = body;

    if (!name || !email || !password || !college || !degree || !domain) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();

    /* Check for existing user */
    const existingUser = await db
      .collection(COLLECTIONS.USERS)
      .findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    /* Hash password */
    const hashedPassword = await bcrypt.hash(password, 12);

    /* Create user */
    const now = new Date();
    const userResult = await db.collection(COLLECTIONS.USERS).insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "INTERN",
      image: null,
      isActive: true,
      emailVerified: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    /* Create profile */
    await db.collection(COLLECTIONS.PROFILES).insertOne({
      userId: userResult.insertedId.toString(),
      phone,
      bio: bio || null,
      education: degree,
      college,
      skills: [],
      github: github || null,
      linkedin: linkedin || null,
      portfolio: portfolio || null,
      resume: null,
      city: null,
      state: null,
      country: null,
      domain,
      createdAt: now,
      updatedAt: now,
    });

    /* Initialize XP */
    await db.collection(COLLECTIONS.XP_TRANSACTIONS).insertOne({
      internId: userResult.insertedId.toString(),
      amount: 50,
      reason: "Welcome bonus — account created",
      taskId: null,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
