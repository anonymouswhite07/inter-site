"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  ClipboardList,
  FileCheck,
  CalendarCheck,
  Award,
  BookOpen,
  Bell,
  BarChart3,
  Users,
  UserCog,
  FolderOpen,
  Megaphone,
  Settings,
  Search,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Menu,
  X,
  Trophy,
  FileText,
  Shield,
  ShieldAlert,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";
import type { UserRole } from "@/types";
import { UserProfileDialog } from "@/components/dashboard/UserProfileDialog";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { OnboardingTour } from "@/components/dashboard/OnboardingTour";

/* ─── Navigation Config ───────────────────────────────────────────────────── */
interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "Dashboard", href: "/dashboard/mentor", icon: LayoutDashboard, roles: ["MENTOR"] },
  { title: "Dashboard", href: "/dashboard/intern", icon: LayoutDashboard, roles: ["INTERN"] },
  { title: "Interns", href: "/dashboard/admin/interns", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "Mentors", href: "/dashboard/admin/mentors", icon: UserCog, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "Batches", href: "/dashboard/admin/batches", icon: FolderOpen, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "My Interns", href: "/dashboard/mentor/interns", icon: Users, roles: ["MENTOR"] },
  { title: "Tasks", href: "/dashboard/admin/tasks", icon: ClipboardList, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "My Tasks", href: "/dashboard/intern/tasks", icon: ClipboardList, roles: ["INTERN"] },
  { title: "Submissions", href: "/dashboard/admin/submissions", icon: FileCheck, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "Reviews", href: "/dashboard/mentor/reviews", icon: FileCheck, badge: 3, roles: ["MENTOR"] },
  { title: "My Submissions", href: "/dashboard/intern/submissions", icon: FileCheck, roles: ["INTERN"] },
  { title: "Attendance", href: "/dashboard/admin/attendance", icon: CalendarCheck, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "Attendance", href: "/dashboard/intern/attendance", icon: CalendarCheck, roles: ["INTERN"] },
  { title: "Reports", href: "/dashboard/intern/reports", icon: FileText, roles: ["INTERN"] },
  { title: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, roles: ["SUPER_ADMIN", "ADMIN", "MENTOR", "INTERN"] },
  { title: "Certificates", href: "/dashboard/admin/certificates", icon: Award, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "My Certificates", href: "/dashboard/intern/certificates", icon: Award, roles: ["INTERN"] },
  { title: "Resources", href: "/dashboard/resources", icon: BookOpen, roles: ["SUPER_ADMIN", "ADMIN", "MENTOR", "INTERN"] },
  { title: "Announcements", href: "/dashboard/admin/announcements", icon: Megaphone, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "Analytics", href: "/dashboard/mentor/analytics", icon: BarChart3, roles: ["MENTOR"] },
  { title: "Profile", href: "/dashboard/intern/profile", icon: User, roles: ["INTERN"] },
  { title: "Settings", href: "/dashboard/admin/settings", icon: Settings, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "Audit Logs", href: "/dashboard/admin/audit", icon: Shield, roles: ["SUPER_ADMIN"] },
];

/* ─── Sidebar Component ───────────────────────────────────────────────────── */
function SidebarContent({
  collapsed,
  userRole,
  pathname,
}: {
  collapsed: boolean;
  userRole: UserRole;
  pathname: string;
}) {
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  /* Group navigation items into sections */
  const mainItems = filteredItems.filter((item) =>
    item.href.includes("/dashboard/") && !item.href.includes("/settings") && !item.href.includes("/audit")
  );
  const systemItems = filteredItems.filter((item) =>
    item.href.includes("/settings") || item.href.includes("/audit")
  );

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    return (
      <Link key={item.href + item.title} href={item.href}>
        <div
          className={`group relative flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all rounded ${
            isActive
              ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--primary))] font-semibold"
              : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))/0.5] hover:text-[hsl(var(--sidebar-foreground))]"
          } ${collapsed ? "justify-center" : ""}`}
        >
          {/* Active indicator line like in MS Learn/Azure */}
          {isActive && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[hsl(var(--primary))]" />
          )}

          <item.icon className={`h-4.5 w-4.5 shrink-0 ${collapsed ? "h-5 w-5" : ""}`} />
          {!collapsed && (
            <>
              <span className="truncate">{item.title}</span>
              {item.badge !== undefined && (
                <Badge
                  variant="secondary"
                  className={`ml-auto h-4.5 min-w-4.5 px-1.5 text-[9px] rounded ${
                    isActive
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </div>
      </Link>
    );
  };

  return (
    <ScrollArea className="flex-1 px-2.5 py-2">
      <div className="space-y-0.5">
        {mainItems.map(renderNavItem)}
      </div>
      {systemItems.length > 0 && (
        <>
          <Separator className="my-3 opacity-50" />
          <div className="space-y-0.5">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[9px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                Administration
              </p>
            )}
            {systemItems.map(renderNavItem)}
          </div>
        </>
      )}
    </ScrollArea>
  );
}

/* ─── Dashboard Layout ────────────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const [maintenanceLockout, setMaintenanceLockout] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Run verification of maintenance gateway status
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isMaintenanceLockout) {
          setMaintenanceLockout(true);
        }
      })
      .catch((err) => console.error("Error checking maintenance:", err));
  }, []);

  const userRole = (session?.user?.role || "INTERN") as UserRole;
  const userName = session?.user?.name || "User";

  // Build a clean Fluent breadcrumb
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
    return { href, label };
  });

  if (maintenanceLockout) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[hsl(var(--background))] p-6 text-center select-none">
        <div className="max-w-[400px] fluent-card p-8 space-y-6 border border-red-200 dark:border-red-950/20 bg-red-500/5">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/20 animate-bounce">
              <ShieldAlert className="h-7 w-7" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-[hsl(var(--foreground))]">Workspace Maintenance</h2>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              Simply Updify is currently undergoing system modifications. All workspace features are temporarily offline.
            </p>
          </div>
          <div className="pt-2 border-t text-[10px] text-[hsl(var(--muted-foreground))]">
            Please contact your system administrator or try again shortly.
          </div>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))] select-none">
        <motion.div
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.98, 1, 0.98],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center gap-4"
        >
          {/* Branded SU Logo */}
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white shadow-lg shadow-[hsl(var(--primary)/0.2)]">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xs font-semibold tracking-wide">Simply Updify</h3>
            <p className="text-[9px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-semibold">
              Initializing Workspace
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* ── Desktop Sidebar (Fluent Navigation Panel) ── */}
      <motion.aside
        animate={{ width: collapsed ? 56 : 220 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className="hidden md:flex flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))]"
      >
        {/* Sidebar Header */}
        <div className={`flex h-12 items-center gap-2 border-b border-[hsl(var(--sidebar-border))] px-4 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[hsl(var(--primary))] text-white">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-semibold tracking-tight"
            >
              Simply Updify
            </motion.span>
          )}
        </div>

        {/* Nav Items */}
        <SidebarContent collapsed={collapsed} userRole={userRole} pathname={pathname} />

        {/* Collapse Toggle */}
        <div className="border-t border-[hsl(var(--sidebar-border))] p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full h-8 rounded justify-start text-xs text-[hsl(var(--muted-foreground))]"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="ml-2 text-[11px]">Minimize navigation</span>}
          </Button>
        </div>
      </motion.aside>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Top Bar (Fluent Banner) ── */}
        <header className="flex h-12 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4">
          
          {/* Left: Breadcrumbs / Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 rounded">
                  <Menu className="h-4.5 w-4.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-0 bg-[hsl(var(--sidebar))]">
                <div className="flex h-12 items-center gap-2 border-b px-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[hsl(var(--primary))] text-white">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold">Simply Updify</span>
                </div>
                <SidebarContent collapsed={false} userRole={userRole} pathname={pathname} />
              </SheetContent>
            </Sheet>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
              <Link href="/" className="hover:underline hover:text-[hsl(var(--foreground))]">Portal</Link>
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                  <span>/</span>
                  <Link
                    href={crumb.href}
                    className={`hover:underline ${
                      idx === breadcrumbs.length - 1 ? "text-[hsl(var(--foreground))] font-medium" : ""
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </span>
              ))}
            </div>
          </div>

          {/* Right: Search, Theme, Profile */}
          <div className="flex items-center gap-1.5">
            <GlobalSearch />

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-7 w-7 rounded"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
            )}

            {/* Notifications */}
            <NotificationBell />

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded px-2 py-1 hover:bg-[hsl(var(--accent))] transition-colors">
                  <Avatar className="h-6.5 w-6.5 rounded-full">
                    <AvatarFallback className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-semibold">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-xs font-medium sm:block text-[hsl(var(--foreground))]">
                    {userName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded border shadow-md bg-[hsl(var(--card))]">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  User Space
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)} className="text-xs rounded cursor-pointer">
                  <User className="mr-2 h-3.5 w-3.5" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPreferencesOpen(true)} className="text-xs rounded cursor-pointer">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs rounded text-[hsl(var(--destructive))] cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Main Scroll Area ── */}
        <main className="flex-1 overflow-auto bg-[hsl(var(--background))] p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Branded Detailed Profile Dialog ── */}
      <UserProfileDialog userId={session?.user?.id || ""} open={profileOpen} onOpenChange={setProfileOpen} />

      {/* ── Branded Preferences & Settings Dialog ── */}
      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="sm:max-w-[420px] rounded border bg-[hsl(var(--card))]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4 text-[hsl(var(--primary))]" />
              System Preferences
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Theme Configuration */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                System Appearance
              </h5>
              <div className="flex items-center justify-between p-3.5 rounded border bg-[hsl(var(--background))] text-xs">
                <span>Toggle Theme Mode</span>
                {mounted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="h-7 text-[10px] px-2.5 rounded hover:bg-[hsl(var(--accent))]"
                  >
                    {theme === "dark" ? <Sun className="mr-1 h-3 w-3" /> : <Moon className="mr-1 h-3 w-3" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </Button>
                )}
              </div>
            </div>

            {/* Change Password Placeholder */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Account Operations
              </h5>
              <div className="p-3.5 rounded border bg-[hsl(var(--background))] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Edit profile details</span>
                  <Button variant="ghost" className="h-7 text-[10px] px-2.5 rounded text-[hsl(var(--primary))] font-semibold">
                    Configure
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span>Change Password</span>
                  <Button variant="ghost" className="h-7 text-[10px] px-2.5 rounded text-[hsl(var(--primary))] font-semibold">
                    Update
                  </Button>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="p-3 bg-[hsl(var(--muted))] border rounded flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
              <span>Account Status</span>
              <span className="flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
                Active On Network
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button
              onClick={() => setPreferencesOpen(false)}
              className="h-8 rounded bg-[hsl(var(--primary))] text-white text-xs font-semibold px-4"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Onboarding Interactive Tour Overlay ── */}
      <OnboardingTour />
    </div>
  );
}
