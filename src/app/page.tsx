"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Moon,
  Sun,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid company email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function CorporatePortalPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Authentication failed. Verify credentials.");
      } else {
        toast.success("Identity verified. Access granted.");
        router.push("/dashboard/intern");
        router.refresh();
      }
    } catch {
      toast.error("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const fillDemoAccount = (email: string) => {
    setValue("email", email);
    setValue("password", "password123");
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col justify-between">
      
      {/* ── Header Bar ── */}
      <header className="h-14 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[hsl(var(--primary))] text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Simply Updify <span className="text-xs font-normal text-[hsl(var(--muted-foreground))] ml-1">Intern Hub</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
          <span className="text-[10px] uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 px-2 py-0.5 rounded font-semibold border border-green-200 dark:border-green-800/30">
            Systems Operational
          </span>
        </div>
      </header>

      {/* ── Main Portal Body ── */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-12 items-stretch">
          
          {/* Left Panel: Corporate Info & Bulletins (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 lg:pr-8">
            <div className="space-y-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
                Internal Network Gateway
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
                Simply Updify Corporate Portal
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xl">
                Authorized access only. Sign in using your corporate-issued credentials to access your task backlog, submit sprint reviews, log hours, and communicate with assigned engineering leads.
              </p>
            </div>

            {/* Resources Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="fluent-card p-4 hover:bg-[hsl(var(--accent))] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <h3 className="text-xs font-semibold">Standard Operating Procedures</h3>
                </div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Review corporate guidelines, Git workflows, and testing standards.
                </p>
              </div>
              <div className="fluent-card p-4 hover:bg-[hsl(var(--accent))] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <h3 className="text-xs font-semibold">Sprint Calendar</h3>
                </div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Important milestones, sprint reviews, and standup schedules.
                </p>
              </div>
            </div>

            {/* Warning Message (Corporate Standard) */}
            <div className="bg-[hsl(var(--muted))] border border-[hsl(var(--border))] p-3.5 rounded flex gap-3 items-start">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                <span className="font-semibold text-[hsl(var(--foreground))]">Security Warning:</span> This system is the property of Simply Updify and is for authorized use only. All activities on this network are logged and monitored. Unauthorized access is strictly prohibited and subject to disciplinary actions.
              </div>
            </div>
          </div>

          {/* Right Panel: Official Login Interface (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="fluent-card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Portal Authentication</h2>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                  Secure single sign-on interface
                </p>
              </div>

              <form method="POST" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Corporate Email
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="username@simplyupdify.app"
                      className="fluent-input h-8 pl-8 text-xs"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      Password
                    </Label>
                    <span className="text-[10px] text-[hsl(var(--primary))] hover:underline cursor-pointer">
                      Reset
                    </span>
                  </div>
                  <div className="relative mt-1">
                    <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="fluent-input h-8 pl-8 pr-8 text-xs"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-[10px] text-[hsl(var(--destructive))]">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-8.5 rounded bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] text-xs font-semibold mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-3.5 w-3.5" />
                  )}
                  {isLoading ? "Verifying Identity..." : "Sign In"}
                </Button>
              </form>

              {/* Quick Access Credentials (SSO Selector Style) */}
              <div className="border-t border-[hsl(var(--border))] pt-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-2">
                  Sandbox Quick Access
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {[
                    { label: "Admin Space", email: "admin@simplyupdify.app" },
                    { label: "Lead Dev", email: "mentor@simplyupdify.app" },
                    { label: "Intern Space", email: "intern@simplyupdify.app" },
                  ].map((demo) => (
                    <button
                      key={demo.label}
                      type="button"
                      onClick={() => fillDemoAccount(demo.email)}
                      className="rounded border border-[hsl(var(--border))] py-1.5 px-1 text-center hover:bg-[hsl(var(--accent))] transition-colors text-[9px] font-medium"
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="h-10 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
        <span>© {new Date().getFullYear()} Simply Updify Inc. All rights reserved.</span>
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer flex items-center gap-1">
            IT Help Desk <ExternalLink className="h-2.5 w-2.5" />
          </span>
          <span className="hover:underline cursor-pointer">Security Compliance</span>
        </div>
      </footer>

    </div>
  );
}
