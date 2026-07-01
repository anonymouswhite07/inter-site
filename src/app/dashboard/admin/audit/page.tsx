import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Shield, Clock, Eye, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Audit Logs — Simply Updify",
};

export default async function AdminAuditPage() {
  const db = await getDb();
  
  // Fetch recent audit logs from MongoDB
  const logs = await db
    .collection(COLLECTIONS.AUDIT_LOGS)
    .find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "ONBOARD_USER":
      case "CREATE_BATCH":
        return "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800/30";
      case "DELETE_ANNOUNCEMENT":
      case "DELETE_RESOURCE":
        return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800/30";
      case "UPDATE_SETTINGS":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800/30";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800/30";
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Security Audit Logs</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Track all critical system operations, configuration modifications, and administrative actions.
        </p>
      </div>

      <div className="fluent-card p-4">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-[hsl(var(--muted-foreground))] space-y-2">
            <Shield className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))] animate-pulse" />
            <p className="font-medium">No system operations have been logged yet.</p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))/0.7]">Perform admin actions to populate logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                  <th className="py-2.5 font-medium">Timestamp</th>
                  <th className="py-2.5 font-medium">Operation</th>
                  <th className="py-2.5 font-medium">Target Resource</th>
                  <th className="py-2.5 font-medium">Actor</th>
                  <th className="py-2.5 font-medium">Actor IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {logs.map((log) => (
                  <tr key={log._id.toString()} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                    <td className="py-3 text-[hsl(var(--muted-foreground))] font-mono text-[10px]">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className={`rounded-sm text-[8px] h-4.5 px-1.5 font-semibold uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                        {log.action.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 font-semibold text-[hsl(var(--foreground))] max-w-[280px] truncate" title={log.resource}>
                      {log.resource}
                    </td>
                    <td className="py-3 text-[11px] text-[hsl(var(--foreground))]">
                      {log.userName || "System Gateway"}
                      <span className="block text-[9px] text-[hsl(var(--muted-foreground))] font-mono">{log.userId}</span>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
