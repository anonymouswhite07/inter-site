"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, ArrowLeft, Loader2, Mail, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserAction } from "@/lib/actions/portal";
import { toast } from "sonner";
import Link from "next/link";

const userSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["INTERN", "MENTOR", "ADMIN"]),
  domain: z.string().optional(),
  mentorName: z.string().optional(),
  duration: z.string().optional(),
});

type UserForm = z.infer<typeof userSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "INTERN",
      domain: "Fullstack Development",
      mentorName: "Arun Krishnan (Lead Mentor)",
      duration: "3 Months",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: UserForm) => {
    setIsPending(true);
    try {
      const res = await createUserAction(data);
      if (res.success) {
        toast.success(res.message);
        reset();
        router.push("/dashboard/admin/interns");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to connect to the onboarding registry.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-[480px] mx-auto space-y-5">
      {/* Header breadcrumb back link */}
      <div>
        <Link 
          href="/dashboard/admin/interns" 
          className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
        </Link>
      </div>

      <div className="fluent-card p-6 space-y-4">
        <div>
          <h1 className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="h-4.5 w-4.5 text-[hsl(var(--primary))]" />
            Onboard Workspace User
          </h1>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
            Create an account. Credentials will be securely sent to their email.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Full Name
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                id="name"
                placeholder="Ravi Kumar"
                className="fluent-input h-8 pl-8 text-xs"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Email Address
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                id="email"
                type="email"
                placeholder="ravi.kumar@company.com"
                className="fluent-input h-8 pl-8 text-xs"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.email.message}</p>
            )}
          </div>

          {/* Role selection */}
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              System Permission Role
            </Label>
            <div className="mt-1">
              <Select
                defaultValue="INTERN"
                onValueChange={(value: any) => setValue("role", value)}
              >
                <SelectTrigger className="h-8 text-xs rounded fluent-input">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--card))] border rounded text-xs">
                  <SelectItem value="INTERN" className="cursor-pointer">Intern</SelectItem>
                  <SelectItem value="MENTOR" className="cursor-pointer">Mentor / Lead Dev</SelectItem>
                  <SelectItem value="ADMIN" className="cursor-pointer">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Intern Tracks */}
          {selectedRole === "INTERN" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 border-t pt-4 border-[hsl(var(--border))]"
            >
              {/* Domain Specialization */}
              <div className="space-y-1">
                <Label htmlFor="domain" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Domain Specialization
                </Label>
                <Input
                  id="domain"
                  placeholder="e.g. Fullstack Development"
                  className="fluent-input h-8 text-xs mt-1"
                  {...register("domain")}
                />
              </div>

              {/* Mentor Lead */}
              <div className="space-y-1">
                <Label htmlFor="mentorName" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Assigned Mentor
                </Label>
                <Input
                  id="mentorName"
                  placeholder="e.g. Arun Krishnan (Lead Mentor)"
                  className="fluent-input h-8 text-xs mt-1"
                  {...register("mentorName")}
                />
              </div>

              {/* Internship Duration */}
              <div className="space-y-1">
                <Label htmlFor="duration" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Internship Duration
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g. 3 Months"
                  className="fluent-input h-8 text-xs mt-1"
                  {...register("duration")}
                />
              </div>
            </motion.div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t">
            <Link href="/dashboard/admin/interns">
              <Button type="button" variant="ghost" className="h-8 text-xs">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isPending}
              className="h-8 rounded bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] text-xs font-semibold px-4"
            >
              {isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              )}
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
