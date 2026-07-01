import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { BookOpen, ExternalLink, FileText, Video, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { AddResourceDialog } from "@/components/dashboard/AddResourceDialog";
import { DeleteResourceButton } from "@/components/dashboard/DeleteResourceButton";

export const metadata = {
  title: "Resources — Simply Updify",
};

export default async function ResourcesPage() {
  const db = await getDb();
  const session = await auth();
  const userRole = session?.user?.role;
  const canPost = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "MENTOR";
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  
  // Fetch all resources
  const resources = await db
    .collection(COLLECTIONS.RESOURCES)
    .find({})
    .toArray();

  const getIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-4.5 w-4.5 text-red-500" />;
      case "VIDEO":
        return <Video className="h-4.5 w-4.5 text-blue-500" />;
      default:
        return <LinkIcon className="h-4.5 w-4.5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Knowledge Repositories</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Access curated reading materials, architecture blueprints, and technical documentation.
          </p>
        </div>
        {canPost && <AddResourceDialog />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.length === 0 ? (
          <div className="fluent-card p-10 text-center text-xs text-[hsl(var(--muted-foreground))] col-span-full space-y-2">
            <BookOpen className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p>No resources uploaded yet.</p>
          </div>
        ) : (
          resources.map((res) => (
            <div key={res._id.toString()} className="fluent-card p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[hsl(var(--accent))] shrink-0">
                      {getIcon(res.type)}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold leading-snug line-clamp-1">{res.title}</h3>
                      <Badge variant="outline" className="rounded-sm text-[8px] h-3.5 px-1.5 mt-0.5 font-medium uppercase">
                        {res.domain || "Shared"}
                      </Badge>
                    </div>
                  </div>
                  {isAdmin && <DeleteResourceButton id={res._id.toString()} />}
                </div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {res.description || "No description provided for this resource."}
                </p>
              </div>

              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button variant="outline" size="sm" className="w-full h-8 rounded text-xs font-medium flex items-center justify-center gap-1">
                  Open Resource <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
