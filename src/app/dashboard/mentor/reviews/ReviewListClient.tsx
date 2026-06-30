"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileCheck,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitReviewAction } from "@/lib/actions/portal";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "RETURNED"]),
  score: z.number()
    .min(0, "Score cannot be less than 0")
    .max(100, "Score cannot exceed 100"),
  comment: z.string().min(5, "Please write an evaluation comment"),
});

type ReviewForm = z.infer<typeof reviewSchema>;

interface ReviewItem {
  _id: string;
  taskId: string;
  internId: string;
  githubUrl: string | null;
  liveUrl: string | null;
  notes: string;
  submittedAt: Date;
  internName: string;
  taskTitle: string;
  taskXp: number;
}

interface ReviewListClientProps {
  submissions: ReviewItem[];
}

export function ReviewListClient({ submissions: initialSubmissions }: ReviewListClientProps) {
  const [submissions, setSubmissions] = useState<ReviewItem[]>(initialSubmissions);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: "APPROVED",
      score: 90,
    },
  });

  const onOpenReview = (submission: ReviewItem) => {
    setSelectedReview(submission);
    setIsReviewOpen(true);
  };

  const onSubmit = async (data: ReviewForm) => {
    if (!selectedReview) return;
    setIsPending(true);
    try {
      const res = await submitReviewAction({
        submissionId: selectedReview._id,
        status: data.status,
        score: data.score,
        comment: data.comment,
      });

      if (res.success) {
        toast.success(res.message);
        setSubmissions((prev) => prev.filter((s) => s._id !== selectedReview._id));
        setIsReviewOpen(false);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to submit evaluation.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3">
      {submissions.length === 0 ? (
        <div className="fluent-card p-10 text-center space-y-3">
          <FileCheck className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <h3 className="text-sm font-semibold">Review queue is empty</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Great job! All submitted tasks have been evaluated.
          </p>
        </div>
      ) : (
        submissions.map((sub) => (
          <div key={sub._id} className="fluent-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[hsl(var(--foreground))]">{sub.taskTitle}</span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">by {sub.internName}</span>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Submitted: {formatDate(sub.submittedAt)}
                </span>
                <span>•</span>
                <span>Reward: {sub.taskXp} XP</span>
              </div>

              {sub.notes && (
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl bg-[hsl(var(--background))] p-2.5 rounded border">
                  <span className="font-semibold text-[hsl(var(--foreground))]">Intern Notes:</span> {sub.notes}
                </p>
              )}

              <div className="flex gap-3 text-[11px]">
                {sub.githubUrl && (
                  <a
                    href={sub.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[hsl(var(--primary))] hover:underline"
                  >
                    View Repository <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {sub.liveUrl && (
                  <a
                    href={sub.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[hsl(var(--primary))] hover:underline"
                  >
                    View Deployment <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => onOpenReview(sub)}
              className="h-7 rounded text-[11px] font-semibold bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] px-3 shrink-0 self-start sm:self-center"
            >
              Evaluate ticket
            </Button>
          </div>
        ))
      )}

      {/* ── Evaluation Dialog ── */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[440px] rounded border bg-[hsl(var(--card))]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Evaluate Ticket</DialogTitle>
            <DialogDescription className="text-xs">
              Assign a score and status for {selectedReview?.internName}&apos;s work.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid gap-4 grid-cols-2">
              <div>
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Status Decision
                </Label>
                <div className="mt-1">
                  <Select
                    defaultValue="APPROVED"
                    onValueChange={(value) => setValue("status", value as any)}
                  >
                    <SelectTrigger className="h-8 text-xs rounded fluent-input">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(var(--card))] border rounded text-xs">
                      <SelectItem value="APPROVED" className="cursor-pointer">Approved (Pass)</SelectItem>
                      <SelectItem value="RETURNED" className="cursor-pointer">Return for changes</SelectItem>
                      <SelectItem value="REJECTED" className="cursor-pointer">Rejected (Fail)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="score" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Score (0 - 100)
                </Label>
                <Input
                  id="score"
                  type="number"
                  placeholder="90"
                  className="fluent-input h-8 text-xs mt-1"
                  {...register("score", { valueAsNumber: true })}
                />
                {errors.score && (
                  <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.score.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="comment" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Evaluation Comments
              </Label>
              <Textarea
                id="comment"
                placeholder="Provide constructive feedback on code quality, performance, and UI details..."
                rows={4}
                className="fluent-input text-xs mt-1 resize-none"
                {...register("comment")}
              />
              {errors.comment && (
                <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.comment.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsReviewOpen(false)}
                className="h-8 rounded text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-8 rounded bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] text-xs font-semibold px-4"
              >
                {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Submit evaluation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
