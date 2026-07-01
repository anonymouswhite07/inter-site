"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteUserAction } from "@/lib/actions/portal";
import { toast } from "sonner";

interface DeleteUserButtonProps {
  id: string;
  userName: string;
}

export function DeleteUserButton({ id, userName }: DeleteUserButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${userName}'s account? This will immediately revoke their platform access.`)) {
      return;
    }

    setIsPending(true);
    try {
      const res = await deleteUserAction(id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to delete user.");
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
      className="h-7 w-7 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
      title="Delete User Account"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
