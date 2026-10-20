import { sendEmail } from "../../../services/mailer";
import type { DemoBooking } from "../../../db/schema";

const APP_URL = process.env.DEMO_BOOKING_PUBLIC_URL || "https://ace-club.app";

function formatParisDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function manageLink(booking: Pick<DemoBooking, "cancelToken">): string {
  return `${APP_URL}/demo/${booking.cancelToken}`;
}

export async function sendProspectConfirmationEmail(booking: DemoBooking): Promise<void> {
  const when = formatParisDateTime(booking.startAt);
  const link = manageLink(booking);
  await sendEmail({
    to: booking.email,
    subject: `Votre démo Ace Club le ${when}`,
    html: `
      <p>Bonjour ${booking.firstName},</p>
      <p>C'est confirmé : rendez-vous le <strong>${when}</strong> (heure de Paris) pour votre démo Ace Club.</p>
      ${booking.googleMeetLink ? `<p>Lien Google Meet : <a href="${booking.googleMeetLink}">${booking.googleMeetLink}</a></p>` : ""}
      <p>Besoin de changer ? <a href="${link}">Annuler ou reporter le rendez-vous</a></p>
      <p>À très vite,<br/>L'équipe Ace Club</p>
    `,
    text: `Bonjour ${booking.firstName},\n\nC'est confirmé : rendez-vous le ${when} (heure de Paris) pour votre démo Ace Club.\n${booking.googleMeetLink ? `Lien Google Meet : ${booking.googleMeetLink}\n` : ""}\nBesoin de changer ? ${link}\n\nÀ très vite,\nL'équipe Ace Club`,
  });
}

export async function sendOwnerNewBookingEmail(ownerEmail: string, booking: DemoBooking): Promise<void> {
  const when = formatParisDateTime(booking.startAt);
  await sendEmail({
    to: ownerEmail,
    subject: `Nouvelle démo réservée — ${booking.clubName}`,
    html: `
      <p>Nouvelle réservation de démo le <strong>${when}</strong> :</p>
      <ul>
        <li>${booking.firstName} ${booking.lastName} — ${booking.email}${booking.phone ? ` — ${booking.phone}` : ""}</li>
        <li>Club : ${booking.clubName}</li>
        <li>Rôle : ${booking.role}</li>
        ${booking.utmSource ? `<li>Source : ${booking.utmSource}</li>` : ""}
        ${booking.note ? `<li>Note : ${booking.note}</li>` : ""}
      </ul>
      ${booking.googleMeetLink ? `<p>Lien Meet : <a href="${booking.googleMeetLink}">${booking.googleMeetLink}</a></p>` : ""}
    `,
    text: `Nouvelle réservation de démo le ${when} :\n${booking.firstName} ${booking.lastName} — ${booking.email}${booking.phone ? ` — ${booking.phone}` : ""}\nClub : ${booking.clubName}\nRôle : ${booking.role}${booking.utmSource ? `\nSource : ${booking.utmSource}` : ""}${booking.note ? `\nNote : ${booking.note}` : ""}`,
  });
}

export async function sendCancellationEmail(booking: DemoBooking): Promise<void> {
  const when = formatParisDateTime(booking.startAt);
  await sendEmail({
    to: booking.email,
    subject: "Votre démo Ace Club a été annulée",
    html: `<p>Bonjour ${booking.firstName},</p><p>Votre rendez-vous du ${when} a bien été annulé. N'hésitez pas à en réserver un nouveau sur <a href="${APP_URL}/demo">${APP_URL}/demo</a> quand vous le souhaitez.</p><p>À bientôt,<br/>L'équipe Ace Club</p>`,
    text: `Bonjour ${booking.firstName},\n\nVotre rendez-vous du ${when} a bien été annulé. N'hésitez pas à en réserver un nouveau sur ${APP_URL}/demo quand vous le souhaitez.\n\nÀ bientôt,\nL'équipe Ace Club`,
  });
}

export async function sendRescheduleConfirmationEmail(booking: DemoBooking): Promise<void> {
  const when = formatParisDateTime(booking.startAt);
  const link = manageLink(booking);
  await sendEmail({
    to: booking.email,
    subject: `Votre démo Ace Club est reportée au ${when}`,
    html: `<p>Bonjour ${booking.firstName},</p><p>Votre démo est bien reportée au <strong>${when}</strong> (heure de Paris).</p>${booking.googleMeetLink ? `<p>Lien Google Meet : <a href="${booking.googleMeetLink}">${booking.googleMeetLink}</a></p>` : ""}<p><a href="${link}">Annuler ou reporter à nouveau</a></p><p>À très vite,<br/>L'équipe Ace Club</p>`,
    text: `Bonjour ${booking.firstName},\n\nVotre démo est bien reportée au ${when} (heure de Paris).\n${booking.googleMeetLink ? `Lien Google Meet : ${booking.googleMeetLink}\n` : ""}\nAnnuler ou reporter à nouveau : ${link}\n\nÀ très vite,\nL'équipe Ace Club`,
  });
}

export async function sendReminderEmail(booking: DemoBooking, label: "veille" | "bientôt"): Promise<void> {
  const when = formatParisDateTime(booking.startAt);
  const intro =
    label === "veille"
      ? "Petit rappel : votre démo Ace Club a lieu demain."
      : "Votre démo Ace Club commence dans moins d'une heure !";
  await sendEmail({
    to: booking.email,
    subject: label === "veille" ? "Rappel : votre démo Ace Club demain" : "Votre démo Ace Club commence bientôt",
    html: `<p>Bonjour ${booking.firstName},</p><p>${intro}</p><p>Rendez-vous le <strong>${when}</strong> (heure de Paris).</p>${booking.googleMeetLink ? `<p>Lien Google Meet : <a href="${booking.googleMeetLink}">${booking.googleMeetLink}</a></p>` : ""}<p>À très vite,<br/>L'équipe Ace Club</p>`,
    text: `Bonjour ${booking.firstName},\n\n${intro}\n\nRendez-vous le ${when} (heure de Paris).\n${booking.googleMeetLink ? `Lien Google Meet : ${booking.googleMeetLink}\n` : ""}\nÀ très vite,\nL'équipe Ace Club`,
  });
}

export async function sendNoSlotContactEmail(ownerEmail: string, prospectEmail: string): Promise<void> {
  await sendEmail({
    to: ownerEmail,
    subject: "Demande de démo — aucun créneau disponible",
    html: `<p>Un prospect n'a trouvé aucun créneau disponible sur /demo et souhaite être recontacté : <strong>${prospectEmail}</strong></p>`,
    text: `Un prospect n'a trouvé aucun créneau disponible sur /demo et souhaite être recontacté : ${prospectEmail}`,
  });
}
