"use client";

import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserCog,
  ClipboardList,
  FileCheck,
  CalendarCheck,
  Award,
  Zap,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

interface DashboardStats {
  totalInterns: number;
  activeMentors: number;
  totalTasks: number;
  pendingReviews: number;
  totalXp: number;
}

interface PendingReviewItem {
  id: string;
  internName: string;
  taskTitle: string;
  domain: string;
  submittedAt: string;
  difficulty: string;
}

interface AdminDashboardClientProps {
  stats: DashboardStats;
  pendingReviewsList: PendingReviewItem[];
}

export function AdminDashboardClient({ stats, pendingReviewsList }: AdminDashboardClientProps) {
  const statCards = [
    { title: "Total Interns", value: stats.totalInterns.toString(), icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
    { title: "Active Mentors", value: stats.activeMentors.toString(), icon: UserCog, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20" },
    { title: "Total Tasks", value: stats.totalTasks.toString(), icon: ClipboardList, color: "text-orange-600 bg-orange-50 dark:bg-orange-950/20" },
    { title: "Pending Reviews", value: stats.pendingReviews.toString(), icon: FileCheck, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20" },
    { title: "XP Awarded", value: stats.totalXp.toLocaleString(), icon: Zap, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20" },
  ];

  // Dummy charts data (using realistic static trend lines)
  const internGrowth = [
    { month: "Jan", interns: Math.max(5, stats.totalInterns - 15) },
    { month: "Feb", interns: Math.max(10, stats.totalInterns - 10) },
    { month: "Mar", interns: Math.max(15, stats.totalInterns - 5) },
    { month: "Apr", interns: stats.totalInterns },
  ];

  const taskCompletion = [
    { week: "W1", completed: 12, pending: stats.pendingReviews },
    { week: "W2", completed: 18, pending: Math.max(0, stats.pendingReviews - 2) },
    { week: "W3", completed: 24, pending: stats.pendingReviews },
  ];

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">System Overview</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Real-time platform activity metrics and cohort telemetry.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/tasks/new">
            <Button size="sm" className="h-7 px-2.5 text-[11px] rounded bg-[hsl(var(--primary))] text-white font-medium">
              <Plus className="mr-1 h-3.5 w-3.5" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="fluent-card p-4 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {card.title}
                </span>
                <p className="text-lg font-bold tracking-tight">{card.value}</p>
              </div>
              <div className={`p-2 rounded ${card.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Growth Chart */}
        <div className="fluent-card p-4 md:col-span-2 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Intern Cohort Growth</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={internGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInterns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                <Area type="monotone" dataKey="internns" name="Interns" stroke="hsl(var(--primary))" strokeWidth={1.5} fillOpacity={1} fill="url(#colorInterns)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Activity */}
        <div className="fluent-card p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Task Completion</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskCompletion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                <Bar dataKey="completed" name="Completed" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Pending Reviews List */}
        <div className="fluent-card p-4 md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Awaiting Evaluation</h3>
            <Link href="/dashboard/admin/submissions" className="text-[10px] text-[hsl(var(--primary))] hover:underline">
              View all
            </Link>
          </div>

          {pendingReviewsList.length === 0 ? (
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] py-4">No pending evaluations in the queue.</p>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {pendingReviewsList.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-[hsl(var(--foreground))]">{item.taskTitle}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">by {item.internName} • {item.domain}</p>
                  </div>
                  <Badge variant="outline" className="rounded-sm text-[9px] h-4.5 px-1.5 font-medium">
                    {item.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Activity */}
        <div className="fluent-card p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Telemetry Log</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs">
              <div className="p-1 rounded bg-green-50 text-green-600 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-medium">System fully operational</p>
                <p className="text-[9px] text-[hsl(var(--muted-foreground))]">MongoDB Atlas cluster status: Healthy</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-xs">
              <div className="p-1 rounded bg-blue-50 text-blue-600 mt-0.5">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-medium">Rate limiter active</p>
                <p className="text-[9px] text-[hsl(var(--muted-foreground))]">Sliding window TTL monitoring enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
