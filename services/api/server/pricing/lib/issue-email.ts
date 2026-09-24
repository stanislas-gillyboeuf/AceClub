import { sendEmail } from "../../../services/mailer";
import { cotisationRequestEmail } from "../../../services/mailer/templates";

export type IssueEmailResult = { sent: true } | { sent: false; reason: string };

/** Sends the first payment request for an issued cotisation. Never throws: an email failure must
 * not undo (or block) the creation of the cotisation record itself. */
export async function sendCotisationRequest(params: {
  clubName: string;
  memberName: string;
  memberEmail: string;
  seasonLabel: string;
  amountCents: number;
}): Promise<IssueEmailResult> {
  try {
    const email = cotisationRequestEmail({
      clubName: params.clubName,
      memberName: params.memberName,
      seasonLabel: params.seasonLabel,
      amountCents: params.amountCents,
      dueDate: null,
    });
    const result = await sendEmail({
      to: params.memberEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    return result.success ? { sent: true } : { sent: false, reason: result.reason ?? "unknown" };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}
