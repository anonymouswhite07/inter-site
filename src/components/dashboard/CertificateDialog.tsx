"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Award, Send, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { issueCertificateAction } from "@/lib/actions/portal";
import { toast } from "sonner";

const certificateSchema = z.object({
  internId: z.string().min(1, "Please select an intern"),
});

type CertificateForm = z.infer<typeof certificateSchema>;

interface InternOption {
  id: string;
  name: string;
}

interface CertificateDialogProps {
  interns: InternOption[];
}

export function CertificateDialog({ interns }: CertificateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CertificateForm>({
    resolver: zodResolver(certificateSchema),
  });

  const onSubmit = async (data: CertificateForm) => {
    setIsPending(true);
    try {
      const res = await issueCertificateAction(data.internId);
      if (res.success) {
        toast.success(res.message);
        setIsOpen(false);
        reset();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to issue certificate.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 px-2.5 text-[11px] rounded bg-[hsl(var(--primary))] text-white font-medium">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Generate Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] rounded border bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Issue Completion Certificate</DialogTitle>
          <DialogDescription className="text-xs">
            Award a verified digital credential to an intern.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Select Recipient Intern
            </Label>
            <div className="mt-1">
              <Select
                onValueChange={(value) => setValue("internId", value)}
              >
                <SelectTrigger className="h-8 text-xs rounded fluent-input">
                  <SelectValue placeholder="Select an intern" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--card))] border rounded text-xs">
                  {interns.map((intern) => (
                    <SelectItem key={intern.id} value={intern.id} className="cursor-pointer">
                      {intern.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.internId && (
              <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.internId.message}</p>
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
              Issue Certificate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
