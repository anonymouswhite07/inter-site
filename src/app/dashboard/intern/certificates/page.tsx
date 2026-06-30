import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { DownloadCertificateButton } from "@/components/dashboard/DownloadCertificateButton";

export const metadata = {
  title: "My Certificates — Simply Updify",
};

export default async function InternCertificatesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();

  // Fetch certificates
  const certificates = await db
    .collection(COLLECTIONS.CERTIFICATES)
    .find({ internId: session.user.id })
    .toArray();

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Credentials</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Access your verified completion certificates and credentials.
        </p>
      </div>

      <div className="fluent-card p-4">
        {certificates.length === 0 ? (
          <div className="py-10 text-center text-xs text-[hsl(var(--muted-foreground))] space-y-2">
            <Award className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p>You haven&apos;t earned any completion certificates yet.</p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
              Complete your sprint backlog tickets to qualify for certification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                  <th className="py-2 font-medium">Credential ID</th>
                  <th className="py-2 font-medium">Domain</th>
                  <th className="py-2 font-medium">Issue Date</th>
                  <th className="py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {certificates.map((cert) => (
                  <tr key={cert._id.toString()} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                    <td className="py-2.5 font-mono text-[11px]">{cert.certificateId}</td>
                    <td className="py-2.5 font-medium">{cert.domain}</td>
                    <td className="py-2.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                      {formatDate(cert.issueDate)}
                    </td>
                    <td className="py-2.5 text-right">
                      <DownloadCertificateButton
                        certificateId={cert.certificateId}
                        internName={session.user.name || "Intern"}
                        domain={cert.domain}
                        issueDate={new Date(cert.issueDate).toLocaleDateString()}
                      />
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
