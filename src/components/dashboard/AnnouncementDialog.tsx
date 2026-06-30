"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Megaphone, Send, Loader2, Plus } from "lucide-react";
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
import { publishAnnouncementAction } from "@/lib/actions/portal";
import { toast } from "sonner";

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type AnnouncementForm = z.infer<typeof announcementSchema>;

export function AnnouncementDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AnnouncementForm>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      priority: "LOW",
    },
  });

  const onSubmit = async (data: AnnouncementForm) => {
    setIsPending(true);
    try {
      const res = await publishAnnouncementAction(data);
      if (res.success) {
        toast.success(res.message);
        setIsOpen(false);
        reset();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to publish announcement.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 px-2.5 text-[11px] rounded bg-[hsl(var(--primary))] text-white font-medium">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Publish Bulletin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] rounded border bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Publish Bulletin</DialogTitle>
          <DialogDescription className="text-xs">
            Broadcase an announcement to all intern dashboards.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="title" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Bulletin Title
            </Label>
            <Input
              id="title"
              placeholder="Weekly Standup Time Changed"
              className="fluent-input h-8 text-xs mt-1"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Priority Level
            </Label>
            <div className="mt-1">
              <Select
                defaultValue="LOW"
                onValueChange={(value) => setValue("priority", value as any)}
              >
                <SelectTrigger className="h-8 text-xs rounded fluent-input">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--card))] border rounded text-xs">
                  <SelectItem value="LOW" className="cursor-pointer">Low (Info)</SelectItem>
                  <SelectItem value="MEDIUM" className="cursor-pointer">Medium (Important)</SelectItem>
                  <SelectItem value="HIGH" className="cursor-pointer">High (Urgent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="content" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Content Message
            </Label>
            <Textarea
              id="content"
              placeholder="Write your bulletin message details here..."
              rows={5}
              className="fluent-input text-xs mt-1 resize-none"
              {...register("content")}
            />
            {errors.content && (
              <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.content.message}</p>
            )}
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
              Publish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
