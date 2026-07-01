"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAnnouncementAction } from "@/lib/actions/portal";
import { toast } from "sonner";

interface DeleteAnnouncementButtonProps {
  id: string;
}

export function DeleteAnnouncementButton({ id }: DeleteAnnouncementButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this announcement? This action is permanent.")) {
      return;
    }

    setIsPending(true);
    try {
      const res = await deleteAnnouncementAction(id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to delete announcement.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="h-6 w-6 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
