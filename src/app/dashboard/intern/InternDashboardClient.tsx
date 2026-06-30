"use client";

import { motion } from "framer-motion";
import {
  Zap,
  CheckCircle2,
  CalendarCheck,
  Flame,
  Clock,
  ArrowRight,
  MessageSquare,
  Trophy,
  Bell,
  Play,
  Square,
  Loader2,
} from "lucide-react";
import {
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
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { clockInAction, clockOutAction } from "@/lib/actions/portal";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface DashboardStats {
  userName: string;
  domain: string;
  totalXp: number;
  completedTasks: number;
  totalTasksCount: number;
  attendanceRate: number;
  streak: number;
  isClockedIn: boolean;
  isClockedOut: boolean;
}

interface InternDashboardClientProps {
  stats: DashboardStats;
  recentTasks: any[];
  announcementsList: any[];
  recentFeedback: any[];
  weeklyProgress: { day: string; hours: number }[];
}

const difficultyColor: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  INTERMEDIATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  ADVANCED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  EXPERT: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

export function InternDashboardClient({
  stats,
  recentTasks,
  announcementsList,
  recentFeedback,
  weeklyProgress,
}: InternDashboardClientProps) {
  const [isClockedIn, setIsClockedIn] = useState(stats.isClockedIn);
  const [isClockedOut, setIsClockedOut] = useState(stats.isClockedOut);
  const [isActionPending, setIsActionPending] = useState(false);

  const handleClockIn = async () => {
    setIsActionPending(true);
    try {
      const res = await clockInAction("Clocked in via dashboard");
      if (res.success) {
        toast.success(res.message);
        setIsClockedIn(true);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to clock in.");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleClockOut = async () => {
    setIsActionPending(true);
    try {
      const res = await clockOutAction();
      if (res.success) {
        toast.success(res.message);
        setIsClockedIn(false);
        setIsClockedOut(true);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to clock out.");
    } finally {
      setIsActionPending(false);
    }
  };

  const statCards = [
    { icon: Zap, label: "XP Points", value: stats.totalXp.toLocaleString(), sub: "Ranked in Cohort", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20" },
    { icon: CheckCircle2, label: "Sprints Completed", value: `${stats.completedTasks} / ${stats.totalTasksCount}`, sub: "Completion status", color: "text-green-600 bg-green-50 dark:bg-green-950/20" },
    { icon: CalendarCheck, label: "Attendance Rate", value: `${stats.attendanceRate}%`, sub: "Shift consistency", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
    { icon: Flame, label: "Active Streak", value: `${stats.streak} days`, sub: "Daily login streak", color: "text-orange-600 bg-orange-50 dark:bg-orange-950/20" },
  ];

  return (
    <div className="space-y-5">
      
      {/* ── Welcome Banner ── */}
      <div className="fluent-card p-5 bg-[hsl(var(--card))] border-l-4 border-l-[hsl(var(--primary))] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            Internship Workspace
          </span>
          <h1 className="text-xl font-semibold tracking-tight mt-1">Welcome back, {stats.userName}</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {stats.domain} Track • Active Cohort
          </p>
        </div>
        
        {/* Duty Console */}
        <div className="flex items-center gap-3">
          {!isClockedIn && !isClockedOut && (
            <Button
              onClick={handleClockIn}
              disabled={isActionPending}
              size="sm"
              className="h-8 rounded bg-green-600 hover:bg-green-700 text-white font-medium text-xs flex items-center gap-1.5 px-3"
            >
              {isActionPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              Clock In
            </Button>
          )}

          {isClockedIn && (
            <Button
              onClick={handleClockOut}
              disabled={isActionPending}
              size="sm"
              className="h-8 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center gap-1.5 px-3"
            >
              {isActionPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />}
              Clock Out
            </Button>
          )}

          {isClockedOut && (
            <Badge className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 text-[10px] h-8 px-3 font-medium">
              Shift Done
            </Badge>
          )}
        </div>
      </div>

      {/* ── Telemetry Grid ── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="fluent-card p-4 flex items-center gap-3.5">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${stat.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">{stat.label}</span>
                <span className="text-lg font-semibold tracking-tight mt-0.5 block">{stat.value}</span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] block mt-0.5">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Middle Section ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Weekly Progress Chart */}
        <div className="fluent-card p-4 lg:col-span-2 space-y-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Sprint Telemetry</h3>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Hours committed per day</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                <Bar dataKey="hours" name="Hours logged" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Announcements Panel */}
        <div className="fluent-card p-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Corporate Bulletins</h3>
          {announcementsList.length === 0 ? (
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">No bulletins posted.</p>
          ) : (
            <div className="space-y-3">
              {announcementsList.map((ann) => (
                <div key={ann.id} className="p-3 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold">{ann.title}</span>
                    <Badge variant="outline" className="rounded-sm text-[8px] h-3.5 px-1.5 uppercase">
                      {ann.priority}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-2">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sprint Backlog Tasks */}
        <div className="fluent-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Assigned Backlog</h3>
            <Link href="/dashboard/intern/tasks">
              <Button variant="ghost" size="sm" className="h-6 text-[10px] p-0 flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">No tasks assigned.</p>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {recentTasks.map((task) => (
                <div key={task._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[hsl(var(--foreground))]">{task.title}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Due: {formatDate(task.deadline)}</p>
                  </div>
                  <Badge variant="outline" className={`rounded-sm text-[9px] h-4.5 px-1.5 font-medium ${difficultyColor[task.difficulty] || ""}`}>
                    {task.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mentor Feedback */}
        <div className="fluent-card p-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Recent Evaluator Feedback</h3>
          {recentFeedback.length === 0 ? (
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">No feedback logged yet.</p>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((fb, idx) => (
                <div key={idx} className="p-3 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <span>Task: {fb.taskTitle}</span>
                    <span className="text-[hsl(var(--primary))]">Score: {fb.score}/100</span>
                  </div>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] italic leading-relaxed">
                    &ldquo;{fb.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
