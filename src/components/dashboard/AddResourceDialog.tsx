"use client";

import { useState } from "react";
import { Plus, Loader2, BookOpen, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createResourceAction } from "@/lib/actions/portal";
import { toast } from "sonner";

export function AddResourceDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"LINK" | "PDF" | "VIDEO">("LINK");
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState("General");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) {
      toast.error("Title and URL are required.");
      return;
    }

    setIsPending(true);
    try {
      const res = await createResourceAction({
        title,
        description,
        type,
        url,
        domain,
      });

      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        // Reset states
        setTitle("");
        setDescription("");
        setType("LINK");
        setUrl("");
        setDomain("General");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to connect to resources registry.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 px-2.5 text-[11px] rounded bg-[hsl(var(--primary))] text-white font-medium">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Share Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] rounded border bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-1.5">
            <BookOpen className="h-4.5 w-4.5 text-[hsl(var(--primary))]" />
            Post Technical Resource
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Resource Title */}
          <div className="space-y-1">
            <Label htmlFor="title" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Resource Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js App Router Blueprint"
              className="fluent-input h-8 text-xs mt-1"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Short Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or instructions for this reading asset..."
              className="w-full min-h-[60px] rounded border bg-[hsl(var(--background))] p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--primary))] mt-1"
            />
          </div>

          {/* Type and Domain Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Resource Type
              </Label>
              <div className="mt-1">
                <Select
                  value={type}
                  onValueChange={(val: any) => setType(val)}
                >
                  <SelectTrigger className="h-8 text-xs rounded fluent-input">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--card))] border rounded text-xs">
                    <SelectItem value="LINK" className="cursor-pointer">Web Link 🌐</SelectItem>
                    <SelectItem value="PDF" className="cursor-pointer">PDF Document 📄</SelectItem>
                    <SelectItem value="VIDEO" className="cursor-pointer">Video Tutorial 🎥</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="domain" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Domain Track
              </Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Web Dev, AI/ML"
                className="fluent-input h-8 text-xs mt-1"
              />
            </div>
          </div>

          {/* Resource URL */}
          <div className="space-y-1">
            <Label htmlFor="url" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Asset Link / URL
            </Label>
            <div className="relative mt-1">
              <Link2 className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="fluent-input h-8 pl-8 text-xs"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-8 text-xs"
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
                <Plus className="mr-1.5 h-3.5 w-3.5" />
              )}
              Post Resource
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
