"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { generateCertificatePDF } from "@/lib/certificates";
import { toast } from "sonner";

interface DownloadCertificateButtonProps {
  certificateId: string;
  internName: string;
  domain: string;
  issueDate: string;
}

export function DownloadCertificateButton({
  certificateId,
  internName,
  domain,
  issueDate,
}: DownloadCertificateButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDownload = () => {
    setIsPending(true);
    try {
      generateCertificatePDF({
        certificateId,
        internName,
        domain,
        issueDate,
      });
      toast.success("Certificate PDF generated successfully.");
    } catch {
      toast.error("Failed to compile certificate PDF.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={isPending}
      className="h-6 px-2 text-[10px] rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"
    >
      {isPending ? (
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
      ) : (
        <Download className="mr-1 h-3 w-3" />
      )}
      PDF
    </Button>
  );
}
