# Codebase Comparison & Changes Report

This document outlines all modifications, additions, and integrations implemented during this session compared to the previous commit.

---

## 🚀 Newly Added Features & Components

We introduced the following new source files to support the requested features:

### 1. Components (`src/components/dashboard/`)
*   **[UserProfileDialog.tsx](file:///j:/internship/src/components/dashboard/UserProfileDialog.tsx)**: Resolves the broken header menu triggers, creating distinct dialog overlays for "My Profile" and "Preferences".
*   **[UserProfileDossier.tsx](file:///j:/internship/src/components/dashboard/UserProfileDossier.tsx)**: Implements the comprehensive editable profile layout, grouping data into **Profile Header** (avatar completes %, badges), **Personal Information** (register, college, department), **Internship Details** (mentor, domain, duration), and **Credentials Upload** (Resume, College ID, Offer Letter).
*   **[NotificationBell.tsx](file:///j:/internship/src/components/dashboard/NotificationBell.tsx)**: Adds functionality to the top header bell icon. Queries `/api/announcements` to render the latest admin announcements feed.
*   **[OnboardingTour.tsx](file:///j:/internship/src/components/dashboard/OnboardingTour.tsx)**: Introduces the guided step-by-step interactive overlay utilizing Framer Motion, spot-lighting navigation panels, bells, and avatar dropdowns for first-time users.
*   **[AddResourceDialog.tsx](file:///j:/internship/src/components/dashboard/AddResourceDialog.tsx)**: Renders the modal used by Admins and Mentors to post reading materials.
*   **[DeleteAnnouncementButton.tsx](file:///j:/internship/src/components/dashboard/DeleteAnnouncementButton.tsx)**: Client component allowing Admins to delete broadcast items.
*   **[DeleteResourceButton.tsx](file:///j:/internship/src/components/dashboard/DeleteResourceButton.tsx)**: Client component allowing Admins to delete shared resource assets.

### 2. API Route Handlers (`src/app/api/`)
*   **[api/profile/route.ts](file:///j:/internship/src/app/api/profile/route.ts)**:
    - `GET`: Combines user and profile collections. Calculates dynamic daily attendance streaks, totals XP achievements, and maps dossier file links.
    - `PATCH`: Enables self-editing of personal details (phone, college, department, location) and uploads, while granting Admins write access to edit all fields (domain, mentor, duration).
*   **[api/announcements/route.ts](file:///j:/internship/src/app/api/announcements/route.ts)**: Serves latest broadcast announcement feeds.
*   **[email.ts](file:///j:/internship/src/lib/email.ts)**: Resend SDK welcome email credentials transmission client.

### 3. Page Routes (`src/app/`)
*   **[admin/users/new/page.tsx](file:///j:/internship/src/app/dashboard/admin/users/new/page.tsx)**: User onboarding form enabling admins to configure specialized tracks (Domain, Mentor, and Duration) when generating accounts.

---

## 🛠️ Modified Code & Configuration Files

| File Path | Description of Changes |
| :--- | :--- |
| **[package.json](file:///j:/internship/package.json)** | Added `framer-motion` and `resend` integrations to support interactive animations and credential emails. |
| **[src/app/dashboard/layout.tsx](file:///j:/internship/src/app/dashboard/layout.tsx)** | Implemented the `<OnboardingTour />` overlay. Added a dynamic checks thread against `/api/profile` to render a styled lock overlay if Maintenance Mode is active. |
| **[src/lib/auth.ts](file:///j:/internship/src/lib/auth.ts)** | Enforced credentials verification check blocking non-admin logins if Maintenance Mode is enabled. |
| **[src/lib/actions/portal.ts](file:///j:/internship/src/lib/actions/portal.ts)** | Added `logAuditAction` to track operations in security logs, along with `deleteResourceAction`, `getSettingsAction`, and `saveSettingsAction` database hooks. |
| **[src/app/dashboard/admin/settings/page.tsx](file:///j:/internship/src/app/dashboard/admin/settings/page.tsx)** | Overhauled the static placeholder settings page, adding active configuration controls (App Name, Allowed Domains, Welcome Sender address, Maintenance Toggle). |
| **[src/app/dashboard/admin/audit/page.tsx](file:///j:/internship/src/app/dashboard/admin/audit/page.tsx)** | Refactored placeholders to read security log operations, timestamps, actor accounts, and client IP addresses dynamically. |
| **[src/app/dashboard/intern/profile/page.tsx](file:///j:/internship/src/app/dashboard/intern/profile/page.tsx)** | Combined the separate layout menus, routing interns to their unified profile dossier display. |
| **[src/app/dashboard/intern/tasks/page.tsx](file:///j:/internship/src/app/dashboard/intern/tasks/page.tsx)** | Corrected tasks listing filters using active user profile matching to display only target domain track sprint tickets. |
| **[src/app/dashboard/admin/tasks/new/NewTaskForm.tsx](file:///j:/internship/src/app/dashboard/admin/tasks/new/NewTaskForm.tsx)** | Appended the target domain classification selector when publishing tickets. |
| **[src/app/api/tasks/route.ts](file:///j:/internship/src/app/api/tasks/route.ts)** | Parsed and saved target domain classification variables inside the MongoDB tasks database collection. |

---

## 🔒 Environment Security Status

All sensitive variables (Atlas cluster connection strings, Resend credentials, and JWT signing tokens) reside in the root `.env` configuration file. This file is excluded from Git via `.gitignore` and is **not** pushed to the remote repository.
