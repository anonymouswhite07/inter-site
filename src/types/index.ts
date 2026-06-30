/* ─── User Roles ──────────────────────────────────────────────────────────── */
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "INTERN";

/* ─── Task & Submission ───────────────────────────────────────────────────── */
export type TaskDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type TaskStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "RETURNED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/* ─── Attendance ──────────────────────────────────────────────────────────── */
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "ON_LEAVE";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

/* ─── Certificate ─────────────────────────────────────────────────────────── */
export type CertificateType = "COMPLETION" | "PARTICIPATION" | "EXCELLENCE" | "TOP_PERFORMER";

/* ─── Notification ────────────────────────────────────────────────────────── */
export type NotificationType =
  | "TASK_ASSIGNED"
  | "SUBMISSION_APPROVED"
  | "SUBMISSION_REJECTED"
  | "DEADLINE_REMINDER"
  | "ANNOUNCEMENT"
  | "CERTIFICATE_GENERATED"
  | "MENTOR_FEEDBACK"
  | "SYSTEM";

/* ─── Batch / Domain ──────────────────────────────────────────────────────── */
export type InternshipDomain =
  | "FRONTEND"
  | "BACKEND"
  | "FULLSTACK"
  | "UIUX"
  | "REACT_NATIVE"
  | "AI_ML"
  | "DIGITAL_MARKETING";

/* ─── Database Models (TypeScript interfaces) ─────────────────────────────── */
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  image?: string;
  isActive: boolean;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Profile {
  _id: string;
  userId: string;
  phone?: string;
  bio?: string;
  education?: string;
  college?: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  resume?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Batch {
  _id: string;
  name: string;
  slug: string;
  domain: InternshipDomain;
  description?: string;
  startDate: Date;
  endDate: Date;
  maxInterns: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  priority: Priority;
  xpReward: number;
  deadline: Date;
  estimatedHours: number;
  batchId?: string;
  createdBy: string;
  attachments: string[];
  resources: string[];
  requiresGithub: boolean;
  requiresLiveDemo: boolean;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  _id: string;
  taskId: string;
  internId: string;
  status: SubmissionStatus;
  githubUrl?: string;
  liveUrl?: string;
  files: string[];
  images: string[];
  videoUrl?: string;
  notes?: string;
  score?: number;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewComment?: string;
  isDraft: boolean;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  _id: string;
  internId: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  hoursWorked?: number;
  notes?: string;
}

export interface LeaveRequest {
  _id: string;
  internId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export interface DailyReport {
  _id: string;
  internId: string;
  date: Date;
  todaysWork: string;
  hoursWorked: number;
  challenges?: string;
  tomorrowGoals?: string;
  mentorFeedback?: string;
  createdAt: Date;
}

export interface Certificate {
  _id: string;
  certificateId: string;
  internId: string;
  type: CertificateType;
  internName: string;
  domain: InternshipDomain;
  batchName: string;
  issueDate: Date;
  expiryDate?: Date;
  qrCodeUrl?: string;
  pdfUrl?: string;
  isValid: boolean;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: Priority;
  audience: "ALL" | "BATCH" | "DOMAIN" | "INDIVIDUAL";
  batchId?: string;
  domain?: InternshipDomain;
  attachments: string[];
  scheduledAt?: Date;
  publishedAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface Resource {
  _id: string;
  title: string;
  description?: string;
  type: "PDF" | "VIDEO" | "ZIP" | "GOOGLE_DRIVE" | "FIGMA" | "GITHUB" | "EXTERNAL_URL";
  url: string;
  fileSize?: number;
  batchId?: string;
  domain?: InternshipDomain;
  createdBy: string;
  createdAt: Date;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface XPTransaction {
  _id: string;
  internId: string;
  amount: number;
  reason: string;
  taskId?: string;
  createdAt: Date;
}

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  xpRequired?: number;
  criteria: string;
}

export interface AuditLog {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

/* ─── Dashboard Stats ─────────────────────────────────────────────────────── */
export interface AdminDashboardStats {
  totalInterns: number;
  activeInterns: number;
  totalMentors: number;
  totalTasks: number;
  pendingReviews: number;
  attendanceRate: number;
  certificatesIssued: number;
  totalXPAwarded: number;
}

export interface InternDashboardStats {
  xpPoints: number;
  tasksCompleted: number;
  totalTasks: number;
  attendanceRate: number;
  currentStreak: number;
  rank: number;
  totalInterns: number;
}

export interface MentorDashboardStats {
  assignedInterns: number;
  pendingReviews: number;
  avgScoreGiven: number;
  activeTasks: number;
  reviewsCompleted: number;
}

/* ─── Navigation ──────────────────────────────────────────────────────────── */
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

/* ─── API Response ────────────────────────────────────────────────────────── */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
