"use client";

import { User } from "lucide-react";
import { UserProfileDossier } from "@/components/dashboard/UserProfileDossier";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserProfileDialogProps {
  userId: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserProfileDialog({ userId, trigger, open, onOpenChange }: UserProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto rounded border bg-[hsl(var(--card))] p-0 select-none">
        <DialogHeader className="p-5 border-b sticky top-0 bg-[hsl(var(--card))] z-10">
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-[hsl(var(--primary))]" />
            Intern Profile Dossier
          </DialogTitle>
        </DialogHeader>

        <div className="p-5">
          <UserProfileDossier userId={userId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
