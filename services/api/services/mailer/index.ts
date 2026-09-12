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
