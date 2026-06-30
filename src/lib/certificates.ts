import { jsPDF } from "jspdf";

interface CertificateParams {
  certificateId: string;
  internName: string;
  domain: string;
  issueDate: string;
}

/**
 * Generates and downloads a professional, vector-based PDF certificate of completion.
 * 
 * @param params CertificateParams
 */
export function generateCertificatePDF(params: CertificateParams) {
  // A4 Landscape dimensions: 297mm x 210mm
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const width = doc.internal.pageSize.getWidth(); // 297
  const height = doc.internal.pageSize.getHeight(); // 210

  // 1. Background Fill (Off-white / cream)
  doc.setFillColor(253, 253, 252);
  doc.rect(0, 0, width, height, "F");

  // 2. Double Border (Corporate Sapphire Blue & Slate)
  doc.setDrawColor(2, 132, 199); // Primary Sapphire
  doc.setLineWidth(1.5);
  doc.rect(8, 8, width - 16, height - 16);

  doc.setDrawColor(100, 116, 139); // Slate Gray
  doc.setLineWidth(0.5);
  doc.rect(10, 10, width - 20, height - 20);

  // 3. Header Branding
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.setFontSize(22);
  doc.text("SIMPLY UPDIFY", width / 2, 32, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("INTERNAL TALENT DEVELOPMENT DIVISION", width / 2, 38, { align: "center" });

  // Decorative Horizontal Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(width / 2 - 40, 44, width / 2 + 40, 44);

  // 4. Main Title
  doc.setFont("helvetica", "bold");
  doc.setTextColor(2, 132, 199); // Sapphire Blue
  doc.setFontSize(28);
  doc.text("CERTIFICATE OF COMPLETION", width / 2, 60, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(12);
  doc.text("This credential is proudly presented to", width / 2, 72, { align: "center" });

  // 5. Intern Name
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(24);
  doc.text(params.internName.toUpperCase(), width / 2, 86, { align: "center" });

  // Underline for name
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(1);
  doc.line(width / 2 - 60, 90, width / 2 + 60, 90);

  // 6. Certificate Text
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(11);
  
  const description = 
    `for successfully completing the Simply Updify intensive internship program in\n` +
    `the field of ${params.domain} development, demonstrating proficiency in\n` +
    `modern industry methodologies, sprint executions, and technical deliverables.`;

  doc.text(description, width / 2, 102, { align: "center", lineHeightFactor: 1.5 });

  // 7. Signatures Row
  const sigY = 150;
  
  // Left: Lead Instructor
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(45, sigY, 105, sigY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text("Arun Krishnan", 75, sigY + 5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Lead Technical Instructor", 75, sigY + 9, { align: "center" });

  // Right: CEO / Director
  doc.line(width - 105, sigY, width - 45, sigY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Jonathan Miller", width - 75, sigY + 5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Director of Engineering", width - 75, sigY + 9, { align: "center" });

  // 8. Footer Credential Verification Details
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  
  const issueDateStr = `ISSUED ON: ${params.issueDate}`;
  const credentialIdStr = `CREDENTIAL ID: ${params.certificateId}`;
  const verificationUrlStr = `VERIFICATION: https://simplyupdify.app/verify/${params.certificateId}`;

  doc.text(issueDateStr, 25, 185);
  doc.text(credentialIdStr, 25, 190);
  doc.text(verificationUrlStr, 25, 195);

  // Download the PDF
  doc.save(`Certificate-${params.certificateId}.pdf`);
}
