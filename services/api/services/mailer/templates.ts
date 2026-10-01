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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** First payment request for a freshly issued cotisation (as opposed to `duesReminderEmail`,
 * which chases an already-issued one). Interpolated values are HTML-escaped. */
export function cotisationRequestEmail(params: {
  clubName: string;
  memberName: string;
  seasonLabel: string;
  amountCents: number;
  dueDate: Date | null;
}) {
  const amount = formatAmount(params.amountCents);
  const club = escapeHtml(params.clubName);
  const member = escapeHtml(params.memberName);
  const season = escapeHtml(params.seasonLabel);
  const dueDateLine = params.dueDate
    ? `<p>Échéance : <strong>${formatDueDate(params.dueDate)}</strong></p>`
    : "";
  const dueDateText = params.dueDate ? `Échéance : ${formatDueDate(params.dueDate)}
` : "";

  return {
    subject: `Votre cotisation ${params.seasonLabel} (${params.clubName})`,
    html: `
      <h2>Bonjour ${member},</h2>
      <p>Votre cotisation <strong>${season}</strong> auprès de ${club} est disponible.</p>
      <p>Montant : <strong>${amount}</strong></p>
      ${dueDateLine}
      <p>Merci de la régler auprès du club.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">Ceci est un email automatique envoyé par ${club} via AceClub.</p>
    `,
    text: `
Bonjour ${params.memberName},

Votre cotisation ${params.seasonLabel} auprès de ${params.clubName} est disponible.

Montant : ${amount}
${dueDateText}
Merci de la régler auprès du club.

---
Ceci est un email automatique envoyé par ${params.clubName} via AceClub.
    `,
  };
}

export function memberAlertDigestEmail(params: {
  clubName: string;
  alerts: { userName: string; detail: string }[];
}) {
  const rows = params.alerts
    .map((a) => `<li><strong>${a.userName}</strong> — ${a.detail}</li>`)
    .join("");
  const textRows = params.alerts.map((a) => `- ${a.userName} — ${a.detail}`).join("\n");

  return {
    subject: `${params.clubName} — ${params.alerts.length} alerte(s) membres`,
    html: `
      <h2>Alertes membres — ${params.clubName}</h2>
      <ul>${rows}</ul>
      <hr>
      <p style="color: #666; font-size: 12px;">Résumé quotidien envoyé automatiquement par AceClub.</p>
    `,
    text: `
Alertes membres — ${params.clubName}

${textRows}

---
Résumé quotidien envoyé automatiquement par AceClub.
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

/** Password reset link — sent by Better Auth's emailAndPassword.sendResetPassword callback
 * (services/api/auth.ts). `resetUrl` is the full link Better Auth generated; it already carries
 * the token and will redirect into the app via the aceclub:// scheme. */
export function resetPasswordEmail(params: { resetUrl: string }) {
  const url = escapeHtml(params.resetUrl);

  return {
    subject: "Réinitialise ton mot de passe Ace Club",
    html: `
      <h2>Réinitialise ton mot de passe</h2>
      <p>Tu as demandé à réinitialiser ton mot de passe Ace Club. Clique sur le lien ci-dessous pour en choisir un nouveau :</p>
      <p><a href="${url}">${url}</a></p>
      <p>Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet email — ton mot de passe actuel reste inchangé.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">Ceci est un email automatique envoyé par AceClub.</p>
    `,
    text: `
Réinitialise ton mot de passe

Tu as demandé à réinitialiser ton mot de passe Ace Club. Ouvre ce lien pour en choisir un nouveau :
${params.resetUrl}

Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet email — ton mot de passe actuel reste inchangé.

---
Ceci est un email automatique envoyé par AceClub.
    `,
  };
}

/** 6-digit code — sent by Better Auth's emailOTP plugin (services/api/auth.ts) for both
 * `email-verification` (after email/password sign-up) and `change-email` (Apple relay users
 * confirming the real address they typed on /apple-email). Same code/UI either way, only the
 * subject differs. */
export function emailVerificationOtpEmail(params: {
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}) {
  const subject =
    params.type === "change-email"
      ? "Confirme ta nouvelle adresse email Ace Club"
      : "Vérifie ton adresse email Ace Club";

  return {
    subject,
    html: `
      <h2>${subject}</h2>
      <p>Voici ton code de vérification :</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${params.otp}</p>
      <p>Ce code expire dans 10 minutes. Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet email.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">Ceci est un email automatique envoyé par AceClub.</p>
    `,
    text: `
${subject}

Voici ton code de vérification : ${params.otp}

Ce code expire dans 10 minutes. Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet email.

---
Ceci est un email automatique envoyé par AceClub.
    `,
  };
}
