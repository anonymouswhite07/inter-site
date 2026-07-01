"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

const taskSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  xpReward: z.number().min(10, "XP Reward must be at least 10").max(1000, "XP Reward cannot exceed 1000"),
  deadline: z.string().min(1, "Please select a deadline date"),
  estimatedHours: z.number().min(1, "Estimated hours must be at least 1"),
  domain: z.string().min(1, "Please specify a target domain classification"),
});

type TaskForm = z.infer<typeof taskSchema>;

export function NewTaskForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      difficulty: "BEGINNER",
      xpReward: 100,
      estimatedHours: 8,
      domain: "All Domains",
    },
  });

  const onSubmit = async (data: TaskForm) => {
    setIsPending(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Task ticket created successfully.");
        router.push("/dashboard/admin/tasks");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create task.");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="fluent-card p-5 space-y-4 max-w-2xl bg-[hsl(var(--card))]">
      <div className="flex items-center gap-2 border-b pb-3 mb-2 border-[hsl(var(--border))]">
        <Link href="/dashboard/admin/tasks">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Create Task Ticket</h3>
      </div>

      <div>
        <Label htmlFor="title" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Task Title
        </Label>
        <Input
          id="title"
          placeholder="Build REST API with Express"
          className="fluent-input h-8 text-xs mt-1"
          {...register("title")}
        />
        {errors.title && (
          <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Task Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the task requirements, deliverables, and acceptance criteria in detail..."
          rows={6}
          className="fluent-input text-xs mt-1 resize-none"
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            Difficulty Tier
          </Label>
          <div className="mt-1">
            <Select
              defaultValue="BEGINNER"
              onValueChange={(value) => setValue("difficulty", value as any)}
            >
              <SelectTrigger className="h-8 text-xs rounded fluent-input">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--card))] border rounded text-xs">
                <SelectItem value="BEGINNER" className="cursor-pointer">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE" className="cursor-pointer">Intermediate</SelectItem>
                <SelectItem value="ADVANCED" className="cursor-pointer">Advanced</SelectItem>
                <SelectItem value="EXPERT" className="cursor-pointer">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="xpReward" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            XP Reward
          </Label>
          <Input
            id="xpReward"
            type="number"
            placeholder="100"
            className="fluent-input h-8 text-xs mt-1"
            {...register("xpReward", { valueAsNumber: true })}
          />
          {errors.xpReward && (
            <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.xpReward.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div>
          <Label htmlFor="deadline" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            Due Date (Deadline)
          </Label>
          <Input
            id="deadline"
            type="date"
            className="fluent-input h-8 text-xs mt-1"
            {...register("deadline")}
          />
          {errors.deadline && (
            <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.deadline.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="estimatedHours" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            Estimated Hours
          </Label>
          <Input
            id="estimatedHours"
            type="number"
            placeholder="8"
            className="fluent-input h-8 text-xs mt-1"
            {...register("estimatedHours", { valueAsNumber: true })}
          />
          {errors.estimatedHours && (
            <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.estimatedHours.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="domain" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Target Domain Classification
        </Label>
        <Input
          id="domain"
          placeholder="e.g. Fullstack Development, UI/UX, or All Domains"
          className="fluent-input h-8 text-xs mt-1"
          {...register("domain")}
        />
        {errors.domain && (
          <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.domain.message}</p>
        )}
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
        Publish Task Ticket
      </Button>
    </form>
  );
}
