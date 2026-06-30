import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Build-time safety fallback: return a pending promise so the compiler doesn't crash
  clientPromise = new Promise(() => {});
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "internship-platform");
}

/* ─── Collection Names ────────────────────────────────────────────────────── */
export const COLLECTIONS = {
  USERS: "users",
  ACCOUNTS: "accounts",
  SESSIONS: "sessions",
  PROFILES: "profiles",
  BATCHES: "batches",
  BATCH_ENROLLMENTS: "batchEnrollments",
  MENTOR_ASSIGNMENTS: "mentorAssignments",
  TASKS: "tasks",
  TASK_ASSIGNMENTS: "taskAssignments",
  SUBMISSIONS: "submissions",
  SUBMISSION_COMMENTS: "submissionComments",
  ATTENDANCE: "attendance",
  LEAVE_REQUESTS: "leaveRequests",
  DAILY_REPORTS: "dailyReports",
  RESOURCES: "resources",
  RESOURCE_ASSIGNMENTS: "resourceAssignments",
  ANNOUNCEMENTS: "announcements",
  CERTIFICATES: "certificates",
  NOTIFICATIONS: "notifications",
  XP_TRANSACTIONS: "xpTransactions",
  ACHIEVEMENTS: "achievements",
  USER_ACHIEVEMENTS: "userAchievements",
  AUDIT_LOGS: "auditLogs",
  SETTINGS: "settings",
} as const;
