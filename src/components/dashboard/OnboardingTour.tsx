"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ArrowRight, X, Compass, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepConfig {
  title: string;
  description: string;
  targetSelector: string; // CSS selector to highlight
  position: "right" | "bottom" | "left" | "center";
}

const TOUR_STEPS: StepConfig[] = [
  {
    title: "Welcome to Simply Updify! 🚀",
    description: "Let's take a quick 1-minute guided tour to show you how to navigate your workspace and complete your onboarding.",
    targetSelector: "body",
    position: "center",
  },
  {
    title: "Fluent Side Navigation 🧭",
    description: "Use this panel to access your active tasks, attendance sheets, leaderboard standings, and educational resources.",
    targetSelector: "aside",
    position: "right",
  },
  {
    title: "Bulletin Broadcasts 📢",
    description: "Keep an eye on this bell! Any company announcement or task notification published by your admins will broadcast here.",
    targetSelector: ".relative.h-7.w-7.rounded", // Selects the Bell trigger button
    position: "bottom",
  },
  {
    title: "Complete Your Profile Dossier 👤",
    description: "CRITICAL: Click your avatar dropdown to open your dossier. Make sure to input your college details and paste the document links for your Resume, College ID, and Offer Letter!",
    targetSelector: ".rounded-full.ring-2", // Selects the user avatar dropdown button
    position: "bottom",
  },
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    // Check if user has already completed the tour
    const completed = localStorage.getItem("SU_ONBOARDING_TOUR_COMPLETED");
    if (!completed) {
      // Start tour after a 2-second delay for smooth loading
      const timer = setTimeout(() => setCurrentStep(0), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update highlight position when step changes
  useEffect(() => {
    if (currentStep < 0 || currentStep >= TOUR_STEPS.length) {
      setHighlightStyle({});
      return;
    }

    const step = TOUR_STEPS[currentStep];
    if (step.position === "center") {
      setHighlightStyle({});
      return;
    }

    const element = document.querySelector(step.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightStyle({
        top: rect.top + window.scrollY - 6,
        left: rect.left + window.scrollX - 6,
        width: rect.width + 12,
        height: rect.height + 12,
        opacity: 1,
      });

      // Smooth scroll target into view if needed
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // Fallback if target element not found (e.g. mobile view sidebar collapsed)
      setHighlightStyle({});
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("SU_ONBOARDING_TOUR_COMPLETED", "true");
    setCurrentStep(-2); // -2 represents finished state
  };

  if (currentStep < 0) return null;

  const activeStep = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none select-none">
        
        {/* Dark overlay backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/70 pointer-events-auto cursor-default"
          onClick={handleComplete}
        />

        {/* Bouncing Circle Spotlight highlight border */}
        {activeStep.position !== "center" && highlightStyle.top !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={highlightStyle}
            className="absolute rounded-lg border-2 border-[hsl(var(--primary))] shadow-[0_0_0_9999px_rgba(2,6,23,0.65),0_0_20px_hsl(var(--primary)/0.6)] animate-pulse pointer-events-none"
          />
        )}

        {/* Guided Tooltip popup box */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={
              activeStep.position === "center"
                ? {}
                : {
                    // Position tooltip relative to the highlight selector rect
                    position: "absolute",
                    top:
                      activeStep.position === "bottom"
                        ? (Number(highlightStyle.top) || 0) + (Number(highlightStyle.height) || 0) + 12
                        : activeStep.position === "right"
                        ? Number(highlightStyle.top) || 0
                        : undefined,
                    left:
                      activeStep.position === "right"
                        ? (Number(highlightStyle.left) || 0) + (Number(highlightStyle.width) || 0) + 16
                        : activeStep.position === "bottom"
                        ? Math.max(16, (Number(highlightStyle.left) || 0) - 80)
                        : undefined,
                  }
            }
            className="w-[340px] fluent-card bg-[hsl(var(--card))] border shadow-2xl p-5 pointer-events-auto space-y-4"
          >
            {/* Header branding info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))]">
                <GraduationCap className="h-4.5 w-4.5" />
                <span>Onboarding Guide</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleComplete}
                className="h-5 w-5 rounded-full hover:bg-[hsl(var(--accent))]"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[hsl(var(--foreground))] flex items-center gap-1">
                {activeStep.title}
              </h3>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                {activeStep.description}
              </p>
            </div>

            {/* Navigation indicator actions */}
            <div className="flex items-center justify-between pt-2 border-t text-[10px]">
              <span className="font-semibold text-[hsl(var(--muted-foreground))]">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <div className="flex gap-1.5">
                {currentStep > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="h-6 text-[9px] px-2.5 rounded"
                  >
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="h-6 text-[9px] px-2.5 rounded bg-[hsl(var(--primary))] text-white font-semibold flex items-center gap-1"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? (
                    <>Finish <CheckCircle className="h-3 w-3" /></>
                  ) : (
                    <>Next <ArrowRight className="h-3 w-3" /></>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </AnimatePresence>
  );
}
