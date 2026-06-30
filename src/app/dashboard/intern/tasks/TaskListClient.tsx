"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Send,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { submitTaskAction } from "@/lib/actions/portal";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Task, Submission } from "@/types";

const submissionSchema = z.object({
  githubUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  notes: z.string().min(5, "Please write a brief description of your work"),
});

type SubmissionForm = z.infer<typeof submissionSchema>;

interface TaskListClientProps {
  tasks: Task[];
  submissions: Submission[];
}

export function TaskListClient({ tasks, submissions }: TaskListClientProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionForm>({
    resolver: zodResolver(submissionSchema),
  });

  const getTaskSubmission = (taskId: string) => {
    return submissions.find((s) => s.taskId === taskId);
  };

  const onOpenSubmit = (task: Task) => {
    setSelectedTask(task);
    reset();
    setIsSubmitOpen(true);
  };

  const onSubmit = async (data: SubmissionForm) => {
    if (!selectedTask) return;
    setIsPending(true);
    try {
      const res = await submitTaskAction({
        taskId: selectedTask._id,
        githubUrl: data.githubUrl,
        liveUrl: data.liveUrl,
        notes: data.notes,
      });

      if (res.success) {
        toast.success(res.message);
        setIsSubmitOpen(false);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to submit task.");
    } finally {
      setIsPending(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 text-[10px]">Approved</Badge>;
      case "REJECTED":
        return <Badge className="rounded-sm bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 text-[10px]">Rejected</Badge>;
      case "RETURNED":
        return <Badge className="rounded-sm bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 text-[10px]">Returned for Changes</Badge>;
      case "SUBMITTED":
        return <Badge className="rounded-sm bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 text-[10px]">Awaiting Evaluation</Badge>;
      default:
        return <Badge variant="outline" className="rounded-sm text-[10px]">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="fluent-card p-10 text-center space-y-3">
          <FolderKanban className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <h3 className="text-sm font-semibold">No tasks assigned</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
            You don&apos;t have any task tickets assigned to your track yet. Keep checking this page for updates from your engineering leads.
          </p>
        </div>
      ) : (
        tasks.map((task) => {
          const submission = getTaskSubmission(task._id);
          const isExpanded = expandedTaskId === task._id;

          return (
            <div key={task._id} className="fluent-card overflow-hidden">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-semibold text-[hsl(var(--foreground))]">{task.title}</span>
                    <Badge variant="outline" className="rounded-sm text-[9px] h-4 px-1.5 uppercase tracking-wider font-semibold">
                      {task.difficulty}
                    </Badge>
                    {getStatusBadge(submission?.status)}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-[10px] text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Due: {formatDate(task.deadline)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-500" /> {task.xpReward} XP
                    </span>
                    <span>•</span>
                    <span>Est. Time: {task.estimatedHours} hrs</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTaskId(isExpanded ? null : task._id)}
                    className="h-7 w-7 p-0 rounded"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  {submission?.status !== "APPROVED" && (
                    <Button
                      size="sm"
                      onClick={() => onOpenSubmit(task)}
                      className="h-7 rounded text-[11px] font-semibold bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] px-3"
                    >
                      {submission ? "Resubmit" : "Submit ticket"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-[hsl(var(--foreground))]">Task Requirements</h4>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed whitespace-pre-line">
                      {task.description}
                    </p>
                  </div>

                  {/* Submission Info */}
                  {submission && (
                    <div className="p-3 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-2.5">
                      <h4 className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Submitted Deliverables
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
                        {submission.githubUrl && (
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[hsl(var(--primary))] hover:underline"
                          >
                            Repository link <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {submission.liveUrl && (
                          <a
                            href={submission.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[hsl(var(--primary))] hover:underline"
                          >
                            Live deployment <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                        <span className="font-semibold text-[hsl(var(--foreground))]">Notes:</span> {submission.notes}
                      </div>

                      {/* Mentor Feedback */}
                      {submission.reviewedAt && (
                        <div className="mt-2.5 pt-2.5 border-t border-[hsl(var(--border))] space-y-1">
                          <span className="font-semibold text-[hsl(var(--foreground))] block text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                            Lead Evaluation
                          </span>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] font-semibold">Score: {submission.score}/100</span>
                          </div>
                          <p className="text-[11px] text-[hsl(var(--muted-foreground))] italic mt-1">
                            &ldquo;{submission.reviewComment}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ── Submission Dialog ── */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="sm:max-w-[480px] rounded border bg-[hsl(var(--card))]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Submit Deliverables</DialogTitle>
            <DialogDescription className="text-xs">
              Provide your repository and deployment links for evaluation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {selectedTask?.requiresGithub && (
              <div>
                <Label htmlFor="githubUrl" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  GitHub Repository URL
                </Label>
                <Input
                  id="githubUrl"
                  placeholder="https://github.com/company/repo"
                  className="fluent-input h-8 text-xs mt-1"
                  {...register("githubUrl")}
                />
                {errors.githubUrl && (
                  <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.githubUrl.message}</p>
                )}
              </div>
            )}

            {selectedTask?.requiresLiveDemo && (
              <div>
                <Label htmlFor="liveUrl" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Live Deployment URL
                </Label>
                <Input
                  id="liveUrl"
                  placeholder="https://sprint-demo.simplyupdify.app"
                  className="fluent-input h-8 text-xs mt-1"
                  {...register("liveUrl")}
                />
                {errors.liveUrl && (
                  <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.liveUrl.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="notes" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Implementation Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Detail your implementation approach, libraries used, and how to verify..."
                rows={4}
                className="fluent-input text-xs mt-1 resize-none"
                {...register("notes")}
              />
              {errors.notes && (
                <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.notes.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSubmitOpen(false)}
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
                Submit ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
