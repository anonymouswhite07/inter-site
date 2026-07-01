import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET Profile: Fetches details for a specific user (or self)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId") || session.user.id;

    // RBAC check: only allow admins to view other users' profiles.
    if (targetUserId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const db = await getDb();

    // Check if maintenance mode is enabled
    const settingsDoc = await db.collection(COLLECTIONS.SETTINGS).findOne({ key: "global_config" });
    const isMaintenance = settingsDoc?.value?.maintenanceMode === true;
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (isMaintenance && !isAdmin) {
      return NextResponse.json({ success: true, isMaintenanceLockout: true });
    }

    // 1. Fetch User details
    const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(targetUserId) });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // 2. Fetch Profile details
    const profile = (await db.collection("Profile").findOne({ userId: new ObjectId(targetUserId) }) 
      || await db.collection("profiles").findOne({ userId: new ObjectId(targetUserId) })
      || {}) as any;

    // 3. Aggregate Progress Metrics
    const tasksCompleted = await db.collection(COLLECTIONS.SUBMISSIONS).countDocuments({
      internId: targetUserId,
      status: "APPROVED",
    });

    const totalAttendance = await db.collection("attendance").countDocuments({
      internId: targetUserId,
      status: "PRESENT",
    });

    const certificatesCount = await db.collection("certificates").countDocuments({
      internId: targetUserId,
    });

    // 4. Calculate actual consecutive attendance streak
    const attendanceRecords = await db.collection("attendance")
      .find({ internId: targetUserId, status: "PRESENT" })
      .toArray();

    // Map to normalized YYYY-MM-DD unique string array, sorted desc
    const presentDates = Array.from(new Set(
      attendanceRecords.map(r => {
        const d = new Date(r.date || r.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
    )).sort((a, b) => b.localeCompare(a));

    let currentStreak = 0;
    if (presentDates.length > 0) {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

      // Streak is active only if they clocked in today or yesterday
      if (presentDates[0] === todayStr || presentDates[0] === yesterdayStr) {
        currentStreak = 1;
        let testDate = new Date(presentDates[0]);
        
        for (let i = 1; i < presentDates.length; i++) {
          const prevDay = new Date(testDate);
          prevDay.setDate(testDate.getDate() - 1);
          const prevDayStr = `${prevDay.getFullYear()}-${String(prevDay.getMonth() + 1).padStart(2, "0")}-${String(prevDay.getDate()).padStart(2, "0")}`;

          if (presentDates[i] === prevDayStr) {
            currentStreak++;
            testDate = prevDay;
          } else {
            break; // Streak broken
          }
        }
      }
    }

    // Structure dossier data (no static fallbacks for new users)
    const personalInfo = {
      registerNumber: profile.registerNumber || "REG-2026-" + targetUserId.substring(targetUserId.length - 4).toUpperCase(),
      collegeName: profile.college || "",
      department: profile.department || "",
      year: profile.year || "",
      email: user.email,
      phoneNumber: profile.phone || "",
      location: profile.city ? `${profile.city}, ${profile.state || ""}` : "",
    };

    const internshipDetails = {
      companyName: "Simply Updify Inc.",
      domain: profile.domain || "Unassigned",
      mentorName: profile.mentorName || "Unassigned",
      startDate: profile.startDate ? new Date(profile.startDate).toLocaleDateString() : "Pending",
      endDate: profile.endDate ? new Date(profile.endDate).toLocaleDateString() : "Pending",
      duration: profile.duration || "Pending",
      status: user.isActive ? "Active" : "Completed",
    };

    const progress = {
      tasksCompleted,
      attendance: `${totalAttendance} Days`,
      hoursWorked: `${totalAttendance * 8} Hours`,
      projects: tasksCompleted > 2 ? 2 : 1,
      certificates: certificatesCount,
      currentStreak: `${currentStreak} Days ${currentStreak > 0 ? "🔥" : ""}`,
    };

    const skills = profile.skills || [];

    const achievements = totalAttendance > 0 ? [
      "Top Performer 🏆",
      "Perfect Attendance 🟢",
      "Fast Learner ⚡",
      "Goal Achiever 🎯"
    ] : [];

    const documents = {
      resume: profile.resume || "",
      collegeId: profile.collegeId || "",
      offerLetter: profile.offerLetter || "",
      certificate: certificatesCount > 0 ? "completion_certificate.pdf" : null,
    };

    const socialLinks = {
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      portfolio: profile.portfolio || "",
      resumeLink: profile.resume || "",
    };

    // Calculate completion %
    let filledFields = 0;
    const fieldsToTrack = [profile.phone, profile.college, profile.github, profile.linkedin, profile.city, profile.resume, profile.collegeId, profile.offerLetter];
    fieldsToTrack.forEach(f => { if (f) filledFields++; });
    const completionPercent = Math.min(20 + (filledFields * 10), 100);

    return NextResponse.json({
      success: true,
      data: {
        userId: targetUserId,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        isActive: user.isActive,
        completionPercent,
        personalInfo,
        internshipDetails,
        progress,
        skills,
        achievements,
        documents,
        socialLinks,
      }
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load profile details" }, { status: 500 });
  }
}

// POST Profile: Save edits
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const targetUserId = body.userId || session.user.id;

    // RBAC check: only allow admins to update other users' profiles.
    const isCallerAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (targetUserId !== session.user.id && !isCallerAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const db = await getDb();

    // 1. Update Core User Details (Admins can update name/isActive; anyone can update their name if editing self)
    const userUpdate: any = {};
    if (body.name) userUpdate.name = body.name;
    if (isCallerAdmin && typeof body.isActive === "boolean") userUpdate.isActive = body.isActive;

    if (Object.keys(userUpdate).length > 0) {
      await db.collection(COLLECTIONS.USERS).updateOne(
        { _id: new ObjectId(targetUserId) },
        { $set: userUpdate }
      );
    }

    // 2. Build the Profile Collection update body
    const profileUpdate: any = {
      phone: body.personalInfo?.phoneNumber || null,
      college: body.personalInfo?.collegeName || null,
      department: body.personalInfo?.department || null,
      year: body.personalInfo?.year || null,
      city: body.personalInfo?.location?.split(",")[0]?.trim() || null,
      state: body.personalInfo?.location?.split(",")[1]?.trim() || null,
      github: body.socialLinks?.github || null,
      linkedin: body.socialLinks?.linkedin || null,
      portfolio: body.socialLinks?.portfolio || null,
      skills: Array.isArray(body.skills) ? body.skills : [],
      resume: body.documents?.resume || null,
      collegeId: body.documents?.collegeId || null,
      offerLetter: body.documents?.offerLetter || null,
      updatedAt: new Date(),
    };

    // Admins can update internship domain & parameters
    if (isCallerAdmin && body.internshipDetails) {
      profileUpdate.domain = body.internshipDetails.domain;
      profileUpdate.mentorName = body.internshipDetails.mentorName;
      profileUpdate.duration = body.internshipDetails.duration;
    }

    // Perform Upsert in Profile collection
    await db.collection("Profile").updateOne(
      { userId: new ObjectId(targetUserId) },
      { $set: profileUpdate },
      { upsert: true }
    );

    // Also try update in lowercase 'profiles' collection for compatibility
    await db.collection("profiles").updateOne(
      { userId: new ObjectId(targetUserId) },
      { $set: profileUpdate },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Profile dossier updated successfully." });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update profile details" }, { status: 500 });
  }
}
