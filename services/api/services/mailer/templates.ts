function formatAmount(amountCents: number): string {
  return (amountCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDueDate(dueDate: Date | null): string {
  if (!dueDate) return "";
  return dueDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function duesReminderEmail(params: {
  clubName: string;
  memberName: string;
  duesTypeName: string;
  amountCents: number;
  dueDate: Date | null;
}) {
  const amount = formatAmount(params.amountCents);
  const dueDateLine = params.dueDate
    ? `<p>Échéance : <strong>${formatDueDate(params.dueDate)}</strong></p>`
    : "";
  const dueDateText = params.dueDate ? `Échéance : ${formatDueDate(params.dueDate)}\n` : "";

  return {
    subject: `Rappel — ${params.duesTypeName} (${params.clubName})`,
    html: `
      <h2>Bonjour ${params.memberName},</h2>
      <p>Il s'agit d'un rappel concernant votre cotisation <strong>${params.duesTypeName}</strong> auprès de ${params.clubName}.</p>
      <p>Montant : <strong>${amount}</strong></p>
      ${dueDateLine}
      <p>Merci de régulariser votre situation auprès du club dès que possible.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">Ceci est un email automatique envoyé par ${params.clubName} via AceClub.</p>
    `,
    text: `
Bonjour ${params.memberName},

Il s'agit d'un rappel concernant votre cotisation ${params.duesTypeName} auprès de ${params.clubName}.

Montant : ${amount}
${dueDateText}
Merci de régulariser votre situation auprès du club dès que possible.

---
Ceci est un email automatique envoyé par ${params.clubName} via AceClub.
    `,
  };
}

export function clubAnnouncementEmail(params: {
  clubName: string;
  subject: string;
  body: string;
}) {
  const htmlBody = params.body
    .split("\n")
    .map((line) => `<p>${line}</p>`)
    .join("");

  return {
    subject: `${params.clubName} — ${params.subject}`,
    html: `
      <h2>${params.subject}</h2>
      ${htmlBody}
      <hr>
      <p style="color: #666; font-size: 12px;">Ce message a été envoyé par ${params.clubName} via AceClub.</p>
    `,
    text: `
${params.subject}

${params.body}

---
Ce message a été envoyé par ${params.clubName} via AceClub.
    `,
  };
}
