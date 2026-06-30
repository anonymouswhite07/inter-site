import { BarChart3 } from "lucide-react";

export const metadata = {
  title: "Mentor Analytics — Simply Updify",
};

export default function MentorAnalyticsPage() {
  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Mentor Telemetry</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Analyze grading history, review queue timelines, and assigned student averages.
        </p>
      </div>

      <div className="fluent-card p-10 text-center space-y-3">
        <BarChart3 className="mx-auto h-8 w-8 text-[hsl(var(--primary))]" />
        <h3 className="text-sm font-semibold">Evaluation Telemetry</h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
          Student performance averages and review velocity tracking will appear here once the active sprint completes.
        </p>
      </div>
    </div>
  );
}
