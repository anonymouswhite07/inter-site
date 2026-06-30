import type { UserRole } from "@/types";

/* ─── Permission Definitions ──────────────────────────────────────────────── */
type Action =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "assign"
  | "export";

type Resource =
  | "dashboard"
  | "interns"
  | "mentors"
  | "tasks"
  | "submissions"
  | "attendance"
  | "certificates"
  | "announcements"
  | "resources"
  | "analytics"
  | "settings"
  | "audit_logs"
  | "batches"
  | "leaderboard"
  | "reports";

const PERMISSIONS: Record<UserRole, Partial<Record<Resource, Action[]>>> = {
  SUPER_ADMIN: {
    dashboard: ["view"],
    interns: ["view", "create", "edit", "delete", "assign", "export"],
    mentors: ["view", "create", "edit", "delete", "assign"],
    tasks: ["view", "create", "edit", "delete"],
    submissions: ["view", "approve", "edit", "delete"],
    attendance: ["view", "edit", "export"],
    certificates: ["view", "create", "delete", "export"],
    announcements: ["view", "create", "edit", "delete"],
    resources: ["view", "create", "edit", "delete"],
    analytics: ["view", "export"],
    settings: ["view", "edit"],
    audit_logs: ["view", "export"],
    batches: ["view", "create", "edit", "delete"],
    leaderboard: ["view"],
    reports: ["view", "export"],
  },
  ADMIN: {
    dashboard: ["view"],
    interns: ["view", "create", "edit", "delete", "assign", "export"],
    mentors: ["view", "create", "edit", "assign"],
    tasks: ["view", "create", "edit", "delete"],
    submissions: ["view", "approve", "edit"],
    attendance: ["view", "edit", "export"],
    certificates: ["view", "create", "export"],
    announcements: ["view", "create", "edit", "delete"],
    resources: ["view", "create", "edit", "delete"],
    analytics: ["view", "export"],
    batches: ["view", "create", "edit"],
    leaderboard: ["view"],
    reports: ["view", "export"],
  },
  MENTOR: {
    dashboard: ["view"],
    interns: ["view"],
    tasks: ["view"],
    submissions: ["view", "approve"],
    attendance: ["view"],
    resources: ["view"],
    analytics: ["view"],
    leaderboard: ["view"],
    reports: ["view"],
  },
  INTERN: {
    dashboard: ["view"],
    tasks: ["view"],
    submissions: ["view", "create", "edit"],
    attendance: ["view", "create"],
    certificates: ["view"],
    resources: ["view"],
    leaderboard: ["view"],
    reports: ["view", "create"],
  },
};

/* ─── Authorization Helpers ───────────────────────────────────────────────── */
export function can(role: UserRole, action: Action, resource: Resource): boolean {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  const actions = perms[resource];
  if (!actions) return false;
  return actions.includes(action);
}

export function isAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function isMentor(role: UserRole): boolean {
  return role === "MENTOR";
}

export function isIntern(role: UserRole): boolean {
  return role === "INTERN";
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/dashboard/admin";
    case "MENTOR":
      return "/dashboard/mentor";
    case "INTERN":
      return "/dashboard/intern";
    default:
      return "/login";
  }
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    MENTOR: "Mentor",
    INTERN: "Intern",
  };
  return labels[role] || role;
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    SUPER_ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    MENTOR: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    INTERN: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return colors[role] || "";
}
