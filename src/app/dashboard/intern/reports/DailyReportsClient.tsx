"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileText,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { submitDailyReportAction } from "@/lib/actions/portal";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { DailyReport } from "@/types";

const reportSchema = z.object({
  todaysWork: z.string().min(10, "Please describe today's work in detail (minimum 10 characters)"),
  hoursWorked: z.number()
    .min(0.5, "Hours worked must be at least 30 minutes (0.5)")
    .max(24, "Hours worked cannot exceed 24"),
  challenges: z.string().optional(),
  tomorrowGoals: z.string().min(5, "Please list at least one goal for tomorrow"),
});

type ReportForm = z.infer<typeof reportSchema>;

interface DailyReportsClientProps {
  reports: DailyReport[];
}

export function DailyReportsClient({ reports: initialReports }: DailyReportsClientProps) {
  const [reports, setReports] = useState<DailyReport[]>(initialReports);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit = async (data: ReportForm) => {
    setIsPending(true);
    try {
      const res = await submitDailyReportAction(data);
      if (res.success) {
        toast.success(res.message);
        const newReport: DailyReport = {
          _id: Math.random().toString(),
          internId: "",
          date: new Date(),
          todaysWork: data.todaysWork,
          hoursWorked: data.hoursWorked,
          challenges: data.challenges || "",
          tomorrowGoals: data.tomorrowGoals,
          mentorFeedback: "",
          createdAt: new Date(),
        };
        setReports((prev) => [newReport, ...prev]);
        reset();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to submit daily report.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="grid gap-5 md:grid-cols-3 items-start">
      
      {/* ── Left Column: Standup Form ── */}
      <div className="md:col-span-1">
        <form onSubmit={handleSubmit(onSubmit)} className="fluent-card p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Log Today&apos;s Standup</h3>
          
          <div>
            <Label htmlFor="todaysWork" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Accomplishments Today
            </Label>
            <Textarea
              id="todaysWork"
              placeholder="What specific tasks did you work on or complete today?..."
              rows={4}
              className="fluent-input text-xs mt-1 resize-none"
              {...register("todaysWork")}
            />
            {errors.todaysWork && (
              <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.todaysWork.message}</p>
            )}
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div>
              <Label htmlFor="hoursWorked" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Hours Spent
              </Label>
              <Input
                id="hoursWorked"
                type="number"
                step="0.5"
                placeholder="8"
                className="fluent-input h-8 text-xs mt-1"
                {...register("hoursWorked", { valueAsNumber: true })}
              />
              {errors.hoursWorked && (
                <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.hoursWorked.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="tomorrowGoals" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Tomorrow&apos;s Goals
              </Label>
              <Input
                id="tomorrowGoals"
                placeholder="Finish unit tests..."
                className="fluent-input h-8 text-xs mt-1"
                {...register("tomorrowGoals")}
              />
              {errors.tomorrowGoals && (
                <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.tomorrowGoals.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="challenges" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Blockers / Challenges (optional)
            </Label>
            <Input
              id="challenges"
              placeholder="API connection timeouts..."
              className="fluent-input h-8 text-xs mt-1"
              {...register("challenges")}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-8.5 rounded bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] text-xs font-semibold flex items-center justify-center gap-1.5 mt-2"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Submit report
          </Button>
        </form>
      </div>

      {/* ── Right Column: History Feed ── */}
      <div className="md:col-span-2 space-y-3 max-h-[600px] overflow-y-auto pr-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">Standup History</h3>
        
        {reports.length === 0 ? (
          <div className="fluent-card p-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No daily reports logged yet. Submit today&apos;s standup to start.
          </div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className="fluent-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-[hsl(var(--border))]">
                <span className="text-xs font-semibold">{formatDate(report.date)}</span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[hsl(var(--primary))]" /> {report.hoursWorked} hrs logged
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div>
                  <span className="font-semibold text-[hsl(var(--foreground))] block">Accomplishments:</span>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed mt-0.5">{report.todaysWork}</p>
                </div>
                {report.challenges && (
                  <div>
                    <span className="font-semibold text-[hsl(var(--foreground))] block">Blockers:</span>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{report.challenges}</p>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-[hsl(var(--foreground))] block">Goals for Tomorrow:</span>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{report.tomorrowGoals}</p>
                </div>
              </div>

              {/* Mentor Feedback */}
              {report.mentorFeedback && (
                <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-2.5 rounded flex gap-2 items-start">
                  <MessageSquare className="h-4 w-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-semibold text-[hsl(var(--foreground))]">Lead feedback:</span>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] italic mt-0.5">&ldquo;{report.mentorFeedback}&rdquo;</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
