import { BarChart3, TrendingUp, Users, ClipboardList } from "lucide-react";

export const metadata = {
  title: "Analytics — Simply Updify",
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Telemetry & Analytics</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Comprehensive cohort performance data, task completion rates, and platform engagement metrics.
        </p>
      </div>

      <div className="fluent-card p-10 text-center space-y-3">
        <BarChart3 className="mx-auto h-8 w-8 text-[hsl(var(--primary))]" />
        <h3 className="text-sm font-semibold">Analytics Console</h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
          Cohort telemetry pipelines are active. Aggregated metrics will appear here on your production dashboard once daily telemetry jobs complete.
        </p>
      </div>
    </div>
  );
}
