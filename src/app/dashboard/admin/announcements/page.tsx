import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Megaphone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { AnnouncementDialog } from "@/components/dashboard/AnnouncementDialog";
import { DeleteAnnouncementButton } from "@/components/dashboard/DeleteAnnouncementButton";

export const metadata = {
  title: "Announcements — Simply Updify",
};

export default async function AdminAnnouncementsPage() {
  const db = await getDb();
  
  // Fetch all announcements
  const announcements = await db
    .collection(COLLECTIONS.ANNOUNCEMENTS)
    .find({})
    .sort({ publishedAt: -1 })
    .toArray();

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Internal Bulletins</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Publish announcements and updates to the intern network.
          </p>
        </div>
        <AnnouncementDialog />
      </div>

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="fluent-card p-10 text-center text-xs text-[hsl(var(--muted-foreground))] space-y-2">
            <Megaphone className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p>No bulletins published yet.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann._id.toString()} className="fluent-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-[hsl(var(--border))]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{ann.title}</span>
                  <Badge variant="outline" className="rounded-sm text-[8px] h-3.5 px-1.5 font-medium uppercase">
                    {ann.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(ann.publishedAt)}
                  </span>
                  <DeleteAnnouncementButton id={ann._id.toString()} />
                </div>
              </div>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
// Helper to resolve MongoDB ObjectId instances inside Server Components
import { ObjectId } from "mongodb";
