import PDFDocument from "pdfkit";

export interface DuesReceiptData {
  clubName: string;
  memberName: string;
  duesTypeName: string;
  amountCents: number;
  paidAt: Date;
  paidMethod: string | null;
}

function formatAmount(amountCents: number): string {
  return (amountCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

/** Builds a simple, plain-text receipt PDF from data already captured in the manual dues
 * tracking flow — no payment processor involved, this is a document, not a transaction. */
export function generateDuesReceiptPdf(data: DuesReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 60 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text(data.clubName, { align: "left" });
    doc.moveDown(1.5);
    doc.fontSize(16).text("Reçu de cotisation", { align: "left" });
    doc.moveDown(1);

    doc.fontSize(11);
    doc.text(`Membre : ${data.memberName}`);
    doc.text(`Cotisation : ${data.duesTypeName}`);
    doc.text(`Montant : ${formatAmount(data.amountCents)}`);
    doc.text(
      `Date de paiement : ${data.paidAt.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}`,
    );
    if (data.paidMethod) {
      doc.text(`Mode de paiement : ${data.paidMethod}`);
    }

    doc.moveDown(2);
    doc.fontSize(11).text("Cotisation reçue.", { align: "left" });

    doc.end();
  });
}
