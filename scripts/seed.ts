/**
 * Database Seed Script
 * Seeds the MongoDB database with demo data for development.
 *
 * Usage: npx tsx scripts/seed.ts
 */
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { loadEnvConfig } from "@next/env";

// Load environment variables from .env.local
loadEnvConfig(process.cwd());

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "internship-platform";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in the environment.");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Starting database seed...\n");

  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  const db = client.db(DB_NAME);

  /* ── Drop existing collections ──────────────────────────────────────────── */
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.dropCollection(col.name);
  }
  console.log("✓ Cleared existing data");

  /* ── Hash passwords ─────────────────────────────────────────────────────── */
  const password = await bcrypt.hash("password123", 12);

  /* ── Users ──────────────────────────────────────────────────────────────── */
  const now = new Date();
  const users = [
    // Admins
    { name: "Super Admin", email: "superadmin@simplyupdify.app", password, role: "SUPER_ADMIN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Admin User", email: "admin@simplyupdify.app", password, role: "ADMIN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Ravi Kumar", email: "ravi@simplyupdify.app", password, role: "ADMIN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },

    // Mentors
    { name: "Arun Krishnan", email: "mentor@simplyupdify.app", password, role: "MENTOR", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Priya Menon", email: "priya.m@simplyupdify.app", password, role: "MENTOR", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Sanjay Gupta", email: "sanjay@simplyupdify.app", password, role: "MENTOR", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Meera Iyer", email: "meera@simplyupdify.app", password, role: "MENTOR", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Vikram Singh", email: "vikram@simplyupdify.app", password, role: "MENTOR", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },

    // Interns
    { name: "Sarah Johnson", email: "intern@simplyupdify.app", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Priya Sharma", email: "priya.s@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Rahul Verma", email: "rahul@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Anjali Patel", email: "anjali@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Karthik Rajan", email: "karthik@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Deepak Kumar", email: "deepak@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Sneha Gupta", email: "sneha@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Arjun Reddy", email: "arjun@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Divya Nair", email: "divya@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Mohit Joshi", email: "mohit@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Neha Kapoor", email: "neha@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Rohan Das", email: "rohan@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Pooja Thakur", email: "pooja@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Vivek Mishra", email: "vivek@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Aisha Khan", email: "aisha@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Suresh Babu", email: "suresh@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Lakshmi Rao", email: "lakshmi@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Amit Sharma", email: "amit@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
    { name: "Tanvi Bhatt", email: "tanvi@demo.com", password, role: "INTERN", isActive: true, image: null, emailVerified: now, createdAt: now, updatedAt: now, deletedAt: null },
  ];

  const userResult = await db.collection("users").insertMany(users);
  const userIds = Object.values(userResult.insertedIds);
  console.log(`✓ Created ${users.length} users`);

  /* ── Batches ────────────────────────────────────────────────────────────── */
  const batches = [
    { name: "Frontend Development — Batch 4", slug: "frontend-batch-4", domain: "FRONTEND", description: "Master modern frontend development with React, Next.js, TypeScript, and Tailwind CSS.", startDate: new Date("2025-06-01"), endDate: new Date("2025-07-31"), maxInterns: 30, isActive: true, createdBy: userIds[0].toString(), createdAt: now, updatedAt: now },
    { name: "Backend Development — Batch 3", slug: "backend-batch-3", domain: "BACKEND", description: "Build scalable backend APIs with Node.js, Express, MongoDB, and PostgreSQL.", startDate: new Date("2025-06-01"), endDate: new Date("2025-07-31"), maxInterns: 25, isActive: true, createdBy: userIds[0].toString(), createdAt: now, updatedAt: now },
    { name: "Full Stack — Batch 2", slug: "fullstack-batch-2", domain: "FULLSTACK", description: "End-to-end web application development from frontend to backend and deployment.", startDate: new Date("2025-06-15"), endDate: new Date("2025-08-15"), maxInterns: 20, isActive: true, createdBy: userIds[0].toString(), createdAt: now, updatedAt: now },
  ];

  const batchResult = await db.collection("batches").insertMany(batches);
  const batchIds = Object.values(batchResult.insertedIds);
  console.log(`✓ Created ${batches.length} batches`);

  /* ── Tasks ──────────────────────────────────────────────────────────────── */
  const tasks = [
    { title: "Build a Responsive Landing Page", description: "Create a modern, responsive landing page using HTML, CSS, and JavaScript. Include a hero section, features, and a contact form.", difficulty: "BEGINNER", status: "PUBLISHED", priority: "MEDIUM", xpReward: 100, deadline: new Date("2025-07-05"), estimatedHours: 8, batchId: batchIds[0].toString(), createdBy: userIds[0].toString(), attachments: [], resources: [], requiresGithub: true, requiresLiveDemo: true, isRecurring: false, createdAt: now, updatedAt: now },
    { title: "Build REST API with Express", description: "Create a RESTful API for a blog application using Express.js and MongoDB. Implement CRUD operations, authentication, and input validation.", difficulty: "ADVANCED", status: "PUBLISHED", priority: "HIGH", xpReward: 200, deadline: new Date("2025-07-08"), estimatedHours: 16, batchId: batchIds[1].toString(), createdBy: userIds[0].toString(), attachments: [], resources: [], requiresGithub: true, requiresLiveDemo: false, isRecurring: false, createdAt: now, updatedAt: now },
    { title: "React Dashboard with Charts", description: "Build an interactive dashboard with data visualization using React and Recharts. Include filters, date range selection, and responsive charts.", difficulty: "INTERMEDIATE", status: "PUBLISHED", priority: "HIGH", xpReward: 150, deadline: new Date("2025-07-10"), estimatedHours: 12, batchId: batchIds[0].toString(), createdBy: userIds[0].toString(), attachments: [], resources: [], requiresGithub: true, requiresLiveDemo: true, isRecurring: false, createdAt: now, updatedAt: now },
    { title: "Authentication System", description: "Implement a complete authentication system with JWT, refresh tokens, password reset, and email verification.", difficulty: "ADVANCED", status: "PUBLISHED", priority: "URGENT", xpReward: 250, deadline: new Date("2025-07-12"), estimatedHours: 20, batchId: batchIds[2].toString(), createdBy: userIds[0].toString(), attachments: [], resources: [], requiresGithub: true, requiresLiveDemo: true, isRecurring: false, createdAt: now, updatedAt: now },
    { title: "Design System Components", description: "Create a reusable component library with buttons, inputs, cards, modals, and tooltips using React and Tailwind CSS.", difficulty: "INTERMEDIATE", status: "PUBLISHED", priority: "MEDIUM", xpReward: 150, deadline: new Date("2025-07-07"), estimatedHours: 10, batchId: batchIds[0].toString(), createdBy: userIds[0].toString(), attachments: [], resources: [], requiresGithub: true, requiresLiveDemo: true, isRecurring: false, createdAt: now, updatedAt: now },
    { title: "Database Schema Design", description: "Design and implement a normalized database schema for an e-commerce application using MongoDB. Include indexes and relationships.", difficulty: "INTERMEDIATE", status: "PUBLISHED", priority: "MEDIUM", xpReward: 120, deadline: new Date("2025-07-06"), estimatedHours: 6, batchId: batchIds[1].toString(), createdBy: userIds[0].toString(), attachments: [], resources: [], requiresGithub: true, requiresLiveDemo: false, isRecurring: false, createdAt: now, updatedAt: now },
  ];

  await db.collection("tasks").insertMany(tasks);
  console.log(`✓ Created ${tasks.length} tasks`);

  /* ── Announcements ──────────────────────────────────────────────────────── */
  const announcements = [
    { title: "Weekly Standup — Every Monday at 10 AM", content: "All interns are required to join the weekly standup meeting every Monday at 10 AM IST. Share your progress, blockers, and plans for the week.", priority: "HIGH", audience: "ALL", attachments: [], publishedAt: now, createdBy: userIds[0].toString(), createdAt: now },
    { title: "New Resources Added: React 19 Comprehensive Guide", content: "We've added a detailed guide on React 19 features including Server Components, Actions, and the new use() hook. Check the Resources section.", priority: "MEDIUM", audience: "ALL", attachments: [], publishedAt: now, createdBy: userIds[1].toString(), createdAt: now },
    { title: "Certificate Generation Starts This Friday", content: "Certificates for completed interns will be generated this Friday. Make sure all your tasks are submitted and reviewed before Thursday EOD.", priority: "HIGH", audience: "ALL", attachments: [], publishedAt: now, createdBy: userIds[0].toString(), createdAt: now },
  ];

  await db.collection("announcements").insertMany(announcements);
  console.log(`✓ Created ${announcements.length} announcements`);

  /* ── XP Transactions ────────────────────────────────────────────────────── */
  const xpTransactions = [];
  const internUserIds = userIds.slice(8); // Intern IDs start at index 8
  for (const internId of internUserIds) {
    // Welcome bonus
    xpTransactions.push({ internId: internId.toString(), amount: 50, reason: "Welcome bonus", taskId: null, createdAt: now });
    // Random XP for demo
    const randomXp = Math.floor(Math.random() * 3000) + 500;
    xpTransactions.push({ internId: internId.toString(), amount: randomXp, reason: "Task completions", taskId: null, createdAt: now });
  }

  await db.collection("xpTransactions").insertMany(xpTransactions);
  console.log(`✓ Created ${xpTransactions.length} XP transactions`);

  /* ── Achievements ───────────────────────────────────────────────────────── */
  const achievements = [
    { name: "First Steps", description: "Complete your first task", icon: "🎯", xpRequired: 0, criteria: "Complete 1 task", createdAt: now },
    { name: "Task Master", description: "Complete 10 tasks", icon: "⚡", xpRequired: 500, criteria: "Complete 10 tasks", createdAt: now },
    { name: "Streak Star", description: "Maintain a 7-day streak", icon: "🔥", xpRequired: 0, criteria: "7 consecutive active days", createdAt: now },
    { name: "XP Champion", description: "Earn 2,000 XP", icon: "🏆", xpRequired: 2000, criteria: "Accumulate 2000 XP", createdAt: now },
    { name: "Perfect Attendance", description: "100% attendance for a week", icon: "📅", xpRequired: 0, criteria: "Full attendance for 7 days", createdAt: now },
    { name: "Code Warrior", description: "Complete 20 tasks", icon: "⚔️", xpRequired: 1500, criteria: "Complete 20 tasks", createdAt: now },
    { name: "Top Performer", description: "Rank #1 on the leaderboard", icon: "👑", xpRequired: 3000, criteria: "Reach rank #1", createdAt: now },
  ];

  await db.collection("achievements").insertMany(achievements);
  console.log(`✓ Created ${achievements.length} achievements`);

  /* ── Create Indexes ─────────────────────────────────────────────────────── */
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ role: 1 });
  await db.collection("profiles").createIndex({ userId: 1 }, { unique: true });
  await db.collection("batches").createIndex({ slug: 1 }, { unique: true });
  await db.collection("batches").createIndex({ domain: 1 });
  await db.collection("tasks").createIndex({ batchId: 1 });
  await db.collection("tasks").createIndex({ status: 1 });
  await db.collection("submissions").createIndex({ taskId: 1, internId: 1 });
  await db.collection("attendance").createIndex({ internId: 1, date: 1 });
  await db.collection("certificates").createIndex({ certificateId: 1 }, { unique: true });
  await db.collection("notifications").createIndex({ userId: 1, isRead: 1 });
  await db.collection("xpTransactions").createIndex({ internId: 1 });
  await db.collection("auditLogs").createIndex({ createdAt: -1 });
  console.log("✓ Created database indexes");

  /* ── Done ───────────────────────────────────────────────────────────────── */
  await client.close();
  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Demo Accounts (password: password123):");
  console.log("   Admin:  admin@simplyupdify.app");
  console.log("   Mentor: mentor@simplyupdify.app");
  console.log("   Intern: intern@simplyupdify.app");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
