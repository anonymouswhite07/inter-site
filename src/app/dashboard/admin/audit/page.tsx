import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Shield, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Audit Logs — Simply Updify",
};

export default async function AdminAuditPage() {
  const db = await getDb();
  
  // Fetch recent audit logs
  const logs = await db
    .collection(COLLECTIONS.AUDIT_LOGS)
    .find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

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
          <div className="py-10 text-center text-xs text-[hsl(var(--muted-foreground))] space-y-2">
            <Shield className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p>No audit logs recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                  <th className="py-2 font-medium">Timestamp</th>
                  <th className="py-2 font-medium">Action</th>
                  <th className="py-2 font-medium">Resource</th>
                  <th className="py-2 font-medium">Actor ID</th>
                  <th className="py-2 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {logs.map((log) => (
                  <tr key={log._id.toString()} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                    <td className="py-2.5 text-[hsl(var(--muted-foreground))] font-mono text-[10px]">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-2.5 font-semibold text-[hsl(var(--foreground))]">{log.action}</td>
                    <td className="py-2.5 text-[hsl(var(--muted-foreground))]">{log.resource}</td>
                    <td className="py-2.5 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                      {log.userId}
                    </td>
                    <td className="py-2.5 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                      {log.ipAddress || "—"}
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
// Helper to resolve MongoDB ObjectId instances inside Server Components
import { ObjectId } from "mongodb";
