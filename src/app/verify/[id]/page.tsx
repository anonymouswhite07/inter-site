import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Award, CheckCircle2, ShieldAlert, Calendar, User, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Verify Credential — Simply Updify",
};

export const dynamic = "force-dynamic";

interface VerifyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { id } = await params;
  const db = await getDb();

  // Find the certificate in MongoDB
  const certificate = await db.collection(COLLECTIONS.CERTIFICATES).findOne({
    certificateId: id,
  });

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="w-full max-w-[480px] z-10 space-y-6">
        
        {/* Branding Header */}
        <div className="text-center space-y-1.5">
          <h2 className="text-sm font-bold tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
            Simply Updify
          </h2>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
            Credential Verification Registry
          </p>
        </div>

        {certificate ? (
          /* ─── SUCCESS: VERIFIED CARD ─── */
          <div className="fluent-card p-6 bg-[hsl(var(--card))] border-t-4 border-t-green-600 space-y-5 text-center relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <Badge className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 text-[9px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </Badge>
            </div>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20 text-green-600">
              <Award className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-base font-bold tracking-tight text-[hsl(var(--foreground))]">
                Verified Achievement
              </h1>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                This certificate has been verified as authentic by Simply Updify.
              </p>
            </div>

            <Separator className="opacity-50" />

            {/* Credential details */}
            <div className="text-left space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="h-4 w-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">Recipient</span>
                  <span className="font-semibold text-[hsl(var(--foreground))] text-xs">{certificate.internName}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Globe className="h-4 w-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">Specialization / Track</span>
                  <span className="font-semibold text-[hsl(var(--foreground))] text-xs">{certificate.domain}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">Issue Date</span>
                  <span className="font-semibold text-[hsl(var(--foreground))] text-xs">{formatDate(certificate.issueDate)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-4 w-4 flex items-center justify-center text-[hsl(var(--primary))] font-mono font-bold text-xs shrink-0 mt-0.5">#</div>
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">Credential ID</span>
                  <span className="font-mono text-[11px] font-semibold text-[hsl(var(--foreground))]">{certificate.certificateId}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── ERROR: INVALID CREDENTIAL ─── */
          <div className="fluent-card p-6 bg-[hsl(var(--card))] border-t-4 border-t-red-500 space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-600">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-base font-bold tracking-tight text-[hsl(var(--foreground))]">
                Invalid Credential ID
              </h1>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                The credential ID <span className="font-mono font-semibold text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded">{id}</span> was not found in our registry. It may be expired, revoked, or invalid.
              </p>
            </div>
          </div>
        )}

        {/* Back to Home CTA */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 text-xs rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
              Go to portal gateway
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

// Reusable separator
function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] w-full bg-[hsl(var(--border))] ${className}`} />;
}
