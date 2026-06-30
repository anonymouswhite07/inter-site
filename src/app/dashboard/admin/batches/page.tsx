import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { FolderOpen, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { BatchDialog } from "@/components/dashboard/BatchDialog";

export const metadata = {
  title: "Manage Batches — Simply Updify",
};

export default async function AdminBatchesPage() {
  const db = await getDb();
  
  // Fetch all batches
  const batches = await db
    .collection(COLLECTIONS.BATCHES)
    .find({})
    .toArray();

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Onboarded Batches</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Manage active cohort timelines and domains.
          </p>
        </div>
        <BatchDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((batch) => (
          <div key={batch._id.toString()} className="fluent-card p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs font-semibold">{batch.name}</h3>
                <Badge variant="outline" className="rounded-sm text-[8px] h-3.5 px-1.5 mt-1.5 font-medium uppercase tracking-wider">
                  {batch.domain}
                </Badge>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">
                <FolderOpen className="h-4 w-4" />
              </div>
            </div>

            <p className="text-[10px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              {batch.description || "No description provided for this batch."}
            </p>

            <div className="border-t border-[hsl(var(--border))] pt-3 grid grid-cols-2 gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                <span>Starts: {formatDate(batch.startDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                <span>Max: {batch.maxInterns} interns</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
