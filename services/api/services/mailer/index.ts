import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  reason?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  if (!resend) {
    console.error("[Mailer] RESEND_API_KEY is not configured — email not sent");
    return { success: false, reason: "EmailNotConfigured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: "AceClub <noreply@ace-club.app>",
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    });

    if (error) {
      console.error("[Mailer] Resend error:", error);
      return { success: false, reason: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Mailer] Exception:", error);
    return { success: false, reason: error instanceof Error ? error.message : "Unknown error" };
  }
}

const BATCH_CHUNK_SIZE = 100; // Resend's batch endpoint accepts at most 100 emails per call.

export interface SendBatchEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendBatchEmailResult {
  sent: number;
  failed: number;
}

/** Broadcast to many recipients at once via Resend's batch endpoint, chunked to its 100/call limit. */
export async function sendBatchEmails(emails: SendBatchEmailParams[]): Promise<SendBatchEmailResult> {
  if (!resend) {
    console.error("[Mailer] RESEND_API_KEY is not configured — batch email not sent");
    return { sent: 0, failed: emails.length };
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += BATCH_CHUNK_SIZE) {
    const chunk = emails.slice(i, i + BATCH_CHUNK_SIZE);
    try {
      const { data, error } = await resend.batch.send(
        chunk.map((email) => ({
          from: "AceClub <noreply@ace-club.app>",
          to: [email.to],
          subject: email.subject,
          html: email.html,
          text: email.text,
        })),
      );

      if (error) {
        console.error("[Mailer] Batch error:", error);
        failed += chunk.length;
        continue;
      }

      sent += data?.data?.length ?? 0;
      failed += chunk.length - (data?.data?.length ?? 0);
    } catch (error) {
      console.error("[Mailer] Batch exception:", error);
      failed += chunk.length;
    }
  }

  return { sent, failed };
}
