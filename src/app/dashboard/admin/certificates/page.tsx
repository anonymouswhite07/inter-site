import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DownloadCertificateButton } from "@/components/dashboard/DownloadCertificateButton";
import { CertificateDialog } from "@/components/dashboard/CertificateDialog";

export const metadata = {
  title: "Certificates — Simply Updify",
};

export default async function AdminCertificatesPage() {
  const db = await getDb();
  
  // 1. Fetch all certificates
  const certificates = await db
    .collection(COLLECTIONS.CERTIFICATES)
    .find({})
    .toArray();

  // 2. Fetch all interns for the dropdown selector
  const internsCursor = await db
    .collection(COLLECTIONS.USERS)
    .find({ role: "INTERN" });
  const internsData = await internsCursor.toArray();

  const internsList = internsData.map((intern) => ({
    id: intern._id.toString(),
    name: intern.name,
  }));

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Credentials & Certificates</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Generate and manage verified digital completion credentials.
          </p>
        </div>
        <CertificateDialog interns={internsList} />
      </div>

      <div className="fluent-card p-4">
        {certificates.length === 0 ? (
          <div className="py-10 text-center text-xs text-[hsl(var(--muted-foreground))] space-y-2">
            <Award className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p>No certificates issued yet.</p>
          </div>
        ) : (
          <>
            {/* ── Desktop Table View (hidden on mobile) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-medium">
                    <th className="py-2 font-medium">Credential ID</th>
                    <th className="py-2 font-medium">Intern</th>
                    <th className="py-2 font-medium">Domain</th>
                    <th className="py-2 font-medium">Issue Date</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {certificates.map((cert) => (
                    <tr key={cert._id.toString()} className="hover:bg-[hsl(var(--accent))/0.3] transition-colors">
                      <td className="py-2.5 font-mono text-[11px]">{cert.certificateId}</td>
                      <td className="py-2.5 font-medium">{cert.internName}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className="rounded-sm text-[8px] h-3.5 px-1.5 font-medium uppercase">
                          {cert.domain}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                        {formatDate(cert.issueDate)}
                      </td>
                      <td className="py-2.5 text-right">
                        <DownloadCertificateButton
                          certificateId={cert.certificateId}
                          internName={cert.internName}
                          domain={cert.domain}
                          issueDate={new Date(cert.issueDate).toLocaleDateString()}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Card Stack View (hidden on desktop) ── */}
            <div className="grid gap-3 md:hidden">
              {certificates.map((cert) => (
                <div
                  key={cert._id.toString()}
                  className="p-3.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
                      {cert.certificateId}
                    </span>
                    <Badge variant="outline" className="rounded-sm text-[8px] h-3.5 px-1.5 font-medium uppercase">
                      {cert.domain}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-[hsl(var(--foreground))]">{cert.internName}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      Issued: {formatDate(cert.issueDate)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[hsl(var(--border))] flex justify-end">
                    <DownloadCertificateButton
                      certificateId={cert.certificateId}
                      internName={cert.internName}
                      domain={cert.domain}
                      issueDate={new Date(cert.issueDate).toLocaleDateString()}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
