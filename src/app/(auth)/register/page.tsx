"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  Phone,
  BookOpen,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    college: z.string().min(2, "Please enter your college name"),
    degree: z.string().min(2, "Please enter your degree"),
    domain: z.string().min(1, "Please select a domain"),
    bio: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    portfolio: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const domains = [
  { value: "FRONTEND", label: "Frontend Development", icon: "🎨" },
  { value: "BACKEND", label: "Backend Development", icon: "⚙️" },
  { value: "FULLSTACK", label: "Full Stack", icon: "🔥" },
  { value: "UIUX", label: "UI/UX Design", icon: "✨" },
  { value: "REACT_NATIVE", label: "React Native", icon: "📱" },
  { value: "AI_ML", label: "AI / ML", icon: "🧠" },
  { value: "DIGITAL_MARKETING", label: "Digital Marketing", icon: "📢" },
];

const steps = [
  { title: "Personal Info", icon: User },
  { title: "Education", icon: BookOpen },
  { title: "Domain & Links", icon: Code2 },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const selectedDomain = watch("domain");

  async function nextStep() {
    const fieldsToValidate: (keyof RegisterForm)[][] = [
      ["name", "email", "phone", "password", "confirmPassword"],
      ["college", "degree"],
      ["domain"],
    ];
    const valid = await trigger(fieldsToValidate[step]);
    if (valid) setStep((s) => Math.min(s + 1, 2));
  }

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Registration successful! Please sign in.");
        router.push("/login");
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-[hsl(239,84%,67%)] via-[hsl(260,73%,60%)] to-[hsl(280,73%,55%)]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">Join Our Program</h1>
            <p className="mt-3 text-lg text-white/80">
              Start your journey with Simply Updify&apos;s structured internship program.
            </p>

            {/* Steps indicator */}
            <div className="mt-12 space-y-4">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    i === step
                      ? "bg-white/20 backdrop-blur-sm"
                      : i < step
                      ? "opacity-60"
                      : "opacity-40"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      i < step
                        ? "bg-white/30"
                        : i === step
                        ? "bg-white text-[hsl(239,84%,67%)]"
                        : "bg-white/10"
                    }`}
                  >
                    {i < step ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <s.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{s.title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg"
        >
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Simply Updify</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[hsl(var(--primary))] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Step Indicator (Mobile) */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 0: Personal Info */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <Input id="name" placeholder="John Doe" className="rounded-xl pl-10" {...register("name")} />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <Input id="reg-email" type="email" placeholder="you@example.com" className="rounded-xl pl-10" {...register("email")} />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <Input id="phone" placeholder="+91 9876543210" className="rounded-xl pl-10" {...register("phone")} />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{errors.phone.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="rounded-xl pl-10"
                        {...register("password")}
                      />
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{errors.password.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="rounded-xl pl-10"
                        {...register("confirmPassword")}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showPassword ? "Hide" : "Show"} password
                </button>
              </motion.div>
            )}

            {/* Step 1: Education */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="college">College / University</Label>
                  <Input id="college" placeholder="XYZ Institute of Technology" className="mt-1.5 rounded-xl" {...register("college")} />
                  {errors.college && <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{errors.college.message}</p>}
                </div>
                <div>
                  <Label htmlFor="degree">Degree & Year</Label>
                  <Input id="degree" placeholder="B.Tech CSE, 3rd Year" className="mt-1.5 rounded-xl" {...register("degree")} />
                  {errors.degree && <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{errors.degree.message}</p>}
                </div>
                <div>
                  <Label htmlFor="bio">Tell us about yourself (optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="What motivates you? What are your goals?"
                    rows={4}
                    className="mt-1.5 rounded-xl resize-none"
                    {...register("bio")}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Domain & Links */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label>Choose Your Domain</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {domains.map((d) => (
                      <label
                        key={d.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-all ${
                          selectedDomain === d.value
                            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary-subtle))] shadow-sm"
                            : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]"
                        }`}
                      >
                        <input type="radio" value={d.value} className="sr-only" {...register("domain")} />
                        <span>{d.icon}</span>
                        <span className="text-xs font-medium">{d.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.domain && <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{errors.domain.message}</p>}
                </div>

                <div>
                  <Label htmlFor="github">GitHub Profile (optional)</Label>
                  <Input id="github" placeholder="https://github.com/username" className="mt-1.5 rounded-xl" {...register("github")} />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile (optional)</Label>
                  <Input id="linkedin" placeholder="https://linkedin.com/in/username" className="mt-1.5 rounded-xl" {...register("linkedin")} />
                </div>
                <div>
                  <Label htmlFor="portfolio">Portfolio URL (optional)</Label>
                  <Input id="portfolio" placeholder="https://yoursite.com" className="mt-1.5 rounded-xl" {...register("portfolio")} />
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep((s) => s - 1)}
                  className="rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 2 ? (
                <Button type="button" onClick={nextStep} className="rounded-xl bg-[hsl(var(--primary))] text-white">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))]"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
