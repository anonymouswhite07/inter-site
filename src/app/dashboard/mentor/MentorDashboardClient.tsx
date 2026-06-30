"use client";

import { motion } from "framer-motion";
import {
  Users,
  FileCheck,
  Star,
  ClipboardList,
  Eye,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

interface DashboardStats {
  assignedCount: number;
  pendingCount: number;
  avgScore: number;
  activeTasks: number;
}

interface InternItem {
  id: string;
  name: string;
  domain: string;
  progress: number;
  xp: number;
}

interface PendingReviewItem {
  id: string;
  internName: string;
  taskTitle: string;
  submittedAt: string;
}

interface MentorDashboardClientProps {
  stats: DashboardStats;
  assignedInterns: InternItem[];
  pendingReviews: PendingReviewItem[];
}

export function MentorDashboardClient({
  stats,
  assignedInterns,
  pendingReviews,
}: MentorDashboardClientProps) {
  const statCards = [
    { icon: Users, label: "Assigned Students", value: stats.assignedCount.toString(), color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
    { icon: FileCheck, label: "Pending Reviews", value: stats.pendingCount.toString(), color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20" },
    { icon: Star, label: "Avg Grading Score", value: stats.avgScore > 0 ? `${stats.avgScore.toFixed(1)}%` : "—", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20" },
    { icon: ClipboardList, label: "Active Tasks", value: stats.activeTasks.toString(), color: "text-green-600 bg-green-50 dark:bg-green-950/20" },
  ];

  const performanceData = [
    { metric: "Task Quality", value: 85 },
    { metric: "Attendance", value: 92 },
    { metric: "Deadlines", value: 78 },
    { metric: "Growth", value: 90 },
  ];

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Instructor Overview</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Track your assigned student cohorts and grade sprint submissions.
        </p>
      </div>

      {/* ── Stats ── */}
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
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Middle Section ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Assigned Interns */}
        <div className="fluent-card p-4 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Assigned Cohort</h3>
            <Badge variant="secondary" className="rounded-sm text-[10px] font-semibold h-5 px-2">
              {assignedInterns.length} students
            </Badge>
          </div>
          
          <div className="space-y-2">
            {assignedInterns.map((intern) => (
              <div key={intern.id} className="flex items-center gap-3 p-2.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))/0.3] transition-all text-xs">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarFallback className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-semibold">
                    {getInitials(intern.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[hsl(var(--foreground))]">{intern.name}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{intern.domain}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">{intern.xp.toLocaleString()} XP</p>
                  <p className="text-[9px] text-[hsl(var(--muted-foreground))]">Cohort standing</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="fluent-card p-4 lg:col-span-2 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Cohort Competency Model</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={performanceData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={9} />
                <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={8} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                <Radar name="Averages" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Evaluation Queue ── */}
      <div className="fluent-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Evaluation Queue</h3>
          <Link href="/dashboard/mentor/reviews">
            <Button size="sm" variant="ghost" className="h-6 text-[10px] p-0">
              Go to reviews
            </Button>
          </Link>
        </div>

        {pendingReviews.length === 0 ? (
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">No pending deliverables awaiting evaluation.</p>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {pendingReviews.map((sub) => (
              <div key={sub.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-[hsl(var(--foreground))]">{sub.taskTitle}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Submitted by {sub.internName} • {sub.submittedAt}</p>
                </div>
                <Link href="/dashboard/mentor/reviews">
                  <Button size="sm" variant="outline" className="h-6 text-[9px] px-2 rounded">
                    Evaluate
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
