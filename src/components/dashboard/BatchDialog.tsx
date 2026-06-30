"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen, Send, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBatchAction } from "@/lib/actions/portal";
import { toast } from "sonner";

const batchSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  domain: z.string().min(1, "Please select a domain"),
  startDate: z.string().min(1, "Please select a start date"),
  endDate: z.string().min(1, "Please select an end date"),
  maxInterns: z.number().min(1, "Capacity must be at least 1"),
  description: z.string().optional(),
});

type BatchForm = z.infer<typeof batchSchema>;

export function BatchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BatchForm>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      maxInterns: 30,
    },
  });

  const onSubmit = async (data: BatchForm) => {
    setIsPending(true);
    try {
      const res = await createBatchAction(data);
      if (res.success) {
        toast.success(res.message);
        setIsOpen(false);
        reset();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to create batch.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 px-2.5 text-[11px] rounded bg-[hsl(var(--primary))] text-white font-medium">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Create Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] rounded border bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Create Intern Cohort (Batch)</DialogTitle>
          <DialogDescription className="text-xs">
            Register a new batch, set timelines, and assign track specializations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid gap-4 grid-cols-2">
            <div>
              <Label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Batch Name
              </Label>
              <Input
                id="name"
                placeholder="Batch 5 - Summer"
                className="fluent-input h-8 text-xs mt-1"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="slug" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Unique Slug
              </Label>
              <Input
                id="slug"
                placeholder="batch-5-summer"
                className="fluent-input h-8 text-xs mt-1"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div>
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Domain Track
              </Label>
              <div className="mt-1">
                <Select
                  onValueChange={(value) => setValue("domain", value)}
                >
                  <SelectTrigger className="h-8 text-xs rounded fluent-input">
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--card))] border rounded text-xs">
                    <SelectItem value="Frontend" className="cursor-pointer">Frontend</SelectItem>
                    <SelectItem value="Backend" className="cursor-pointer">Backend</SelectItem>
                    <SelectItem value="Full Stack" className="cursor-pointer">Full Stack</SelectItem>
                    <SelectItem value="UI/UX" className="cursor-pointer">UI/UX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.domain && (
                <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.domain.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="maxInterns" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Max Capacity
              </Label>
              <Input
                id="maxInterns"
                type="number"
                placeholder="30"
                className="fluent-input h-8 text-xs mt-1"
                {...register("maxInterns", { valueAsNumber: true })}
              />
              {errors.maxInterns && (
                <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.maxInterns.message}</p>
              )}
            </div>
          </div>

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
            <Label htmlFor="description" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the cohort objectives, syllabus links, or notes..."
              rows={3}
              className="fluent-input text-xs mt-1 resize-none"
              {...register("description")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
