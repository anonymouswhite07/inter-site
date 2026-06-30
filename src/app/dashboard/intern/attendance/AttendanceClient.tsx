"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Clock,
  Play,
  Square,
  Calendar,
  Send,
  Loader2,
  CheckCircle2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { clockInAction, clockOutAction } from "@/lib/actions/portal";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { Attendance, LeaveRequest } from "@/types";

const leaveSchema = z.object({
  startDate: z.string().min(1, "Please select a start date"),
  endDate: z.string().min(1, "Please select an end date"),
  reason: z.string().min(10, "Please provide a detailed reason (minimum 10 characters)"),
});

type LeaveForm = z.infer<typeof leaveSchema>;

interface AttendanceClientProps {
  attendance: Attendance[];
  leaves: LeaveRequest[];
  isClockedIn: boolean;
  isClockedOut: boolean;
}

export function AttendanceClient({
  attendance,
  leaves,
  isClockedIn: initialClockedIn,
  isClockedOut: initialClockedOut,
}: AttendanceClientProps) {
  const [isClockedIn, setIsClockedIn] = useState(initialClockedIn);
  const [isClockedOut, setIsClockedOut] = useState(initialClockedOut);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveForm>({
    resolver: zodResolver(leaveSchema),
  });

  const handleClockIn = async () => {
    setIsActionPending(true);
    try {
      const res = await clockInAction("Clocked in via portal");
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

  const onLeaveSubmit = async (data: LeaveForm) => {
    setIsPending(true);
    try {
      // Direct fetch to submit leave request
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Leave request submitted successfully.");
        setIsLeaveOpen(false);
        reset();
      } else {
        toast.error(result.error || "Failed to submit leave request.");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  const getLeaveStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 text-[10px]">Approved</Badge>;
      case "REJECTED":
        return <Badge className="rounded-sm bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 text-[10px]">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="rounded-sm text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400">Pending</Badge>;
    }
  };

  return (
    <div className="grid gap-5 md:grid-cols-3 items-start">
      
      {/* ── Left Column: Clock Actions ── */}
      <div className="space-y-5 md:col-span-1">
        <div className="fluent-card p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Duty Console</h3>
          
          <div className="flex flex-col gap-3">
            {!isClockedIn && !isClockedOut && (
              <Button
                onClick={handleClockIn}
                disabled={isActionPending}
                className="w-full h-10 rounded bg-green-600 hover:bg-green-700 text-white font-medium text-xs flex items-center justify-center gap-2"
              >
                {isActionPending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Play className="h-4.5 w-4.5" />}
                Clock In
              </Button>
            )}

            {isClockedIn && (
              <Button
                onClick={handleClockOut}
                disabled={isActionPending}
                className="w-full h-10 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center justify-center gap-2"
              >
                {isActionPending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Square className="h-4.5 w-4.5" />}
                Clock Out
              </Button>
            )}

            {isClockedOut && (
              <div className="bg-[hsl(var(--muted))] p-3.5 rounded border text-center text-xs space-y-1">
                <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />
                <p className="font-semibold text-[hsl(var(--foreground))]">Shift Completed</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">You have completed your shift for today.</p>
              </div>
            )}
          </div>

          <Separator className="opacity-50" />

          <Button
            variant="outline"
            onClick={() => setIsLeaveOpen(true)}
            className="w-full h-8.5 rounded text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <Calendar className="h-4 w-4" />
            Request Leave
          </Button>
        </div>

        {/* Leave Requests Log */}
        <div className="fluent-card p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Leave History</h3>
          {leaves.length === 0 ? (
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">No leave requests filed.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {leaves.map((leave) => (
                <div key={leave._id} className="p-2.5 rounded border text-[11px] bg-[hsl(var(--background))] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </span>
                    {getLeaveStatusBadge(leave.status)}
                  </div>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">{leave.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Column: Logs Table ── */}
      <div className="fluent-card p-4 md:col-span-2 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Attendance Log</h3>
        
        {attendance.length === 0 ? (
          <div className="py-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No attendance history found. Clock in to log your first record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Clock In</th>
                  <th className="py-2 font-medium">Clock Out</th>
                  <th className="py-2 font-medium">Hours</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {attendance.map((row) => (
                  <tr key={row._id} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                    <td className="py-2.5 font-medium">{formatDate(row.date)}</td>
                    <td className="py-2.5 text-[hsl(var(--muted-foreground))]">
                      {row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="py-2.5 text-[hsl(var(--muted-foreground))]">
                      {row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="py-2.5 font-medium">{row.hoursWorked ? `${row.hoursWorked}h` : "—"}</td>
                    <td className="py-2.5">
                      <Badge className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 text-[9px] h-4.5 px-1.5 font-medium">
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Leave Request Dialog ── */}
      <Dialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen}>
        <DialogContent className="sm:max-w-[420px] rounded border bg-[hsl(var(--card))]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Request Leave Absence</DialogTitle>
            <DialogDescription className="text-xs">
              File a formal absence request for manager evaluation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onLeaveSubmit)} className="space-y-4 py-2">
            <div className="grid gap-4 grid-cols-2">
              <div>
                <Label htmlFor="startDate" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="fluent-input h-8 text-xs mt-1"
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="endDate" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  className="fluent-input h-8 text-xs mt-1"
                  {...register("endDate")}
                />
                {errors.endDate && (
                  <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="reason" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Reason for Absence
              </Label>
              <Textarea
                id="reason"
                placeholder="Provide a detailed explanation for your absence request..."
                rows={4}
                className="fluent-input text-xs mt-1 resize-none"
                {...register("reason")}
              />
              {errors.reason && (
                <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.reason.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsLeaveOpen(false)}
                className="h-8 rounded text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-8 rounded bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] text-xs font-semibold px-4"
              >
                {isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                )}
                Submit request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
