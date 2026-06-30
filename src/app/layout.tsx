import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/providers";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Simply Updify Internship Platform",
    template: "%s | Simply Updify",
  },
  description:
    "Professional internship management platform by Simply Updify. Manage interns, tasks, submissions, analytics, and certifications with enterprise-grade tools.",
  keywords: [
    "internship",
    "management",
    "platform",
    "Simply Updify",
    "intern tracking",
    "task management",
    "certificates",
  ],
  authors: [{ name: "Simply Updify" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Simply Updify Internship Platform",
    title: "Simply Updify Internship Platform",
    description:
      "Professional internship management platform. Manage interns, tasks, submissions, analytics, and certifications.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            <Providers>
              {children}
            </Providers>
          </TooltipProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "var(--radius)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
