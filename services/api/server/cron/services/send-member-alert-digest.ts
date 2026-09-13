import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { member, organization, user } from "../../../db/schema";
import { sendEmail } from "../../../services/mailer";
import { memberAlertDigestEmail } from "../../../services/mailer/templates";
import { computeMemberAlerts } from "../../club-dashboard/lib/member-alerts";

/** Daily digest to every full admin, per club, of members needing attention (license/medical
 * certificate/dues) — the same computation the homepage's "Alertes membres" card uses. */
export async function sendMemberAlertDigest(): Promise<{ clubsNotified: number; emailsSent: number }> {
  const organizations = await db.select({ id: organization.id, name: organization.name }).from(organization);

  let clubsNotified = 0;
  let emailsSent = 0;

  for (const org of organizations) {
    const alerts = await computeMemberAlerts(org.id);
    if (alerts.length === 0) continue;

    const admins = await db
      .select({ email: user.email })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(and(eq(member.organizationId, org.id), inArray(member.role, ["owner", "admin"])));

    const orgAdminEmails = admins.map((a) => a.email);
    if (orgAdminEmails.length === 0) continue;

    const email = memberAlertDigestEmail({
      clubName: org.name,
      alerts: alerts.map((a) => ({ userName: a.userName, detail: a.detail })),
    });

    for (const to of orgAdminEmails) {
      const result = await sendEmail({ to, ...email });
      if (result.success) emailsSent++;
    }
    clubsNotified++;
  }

  return { clubsNotified, emailsSent };
}
