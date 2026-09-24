import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { member, organization, user } from "../../../db/schema";
import { sendEmail } from "../../../services/mailer";
import { memberAlertDigestEmail } from "../../../services/mailer/templates";
import { computeMemberAlerts } from "../../club-dashboard/lib/member-alerts";
import { resolveContactEmails } from "../../pricing/lib/resolve-contact-email";

/** Daily digest to every full admin, per club, of members needing attention (license, medical
 * certificate, overdue cotisation) — the same computation as the homepage "Alertes" card. */
export async function sendMemberAlertDigest(): Promise<{ clubsNotified: number; emailsSent: number }> {
  const organizations = await db.select({ id: organization.id, name: organization.name }).from(organization);

  let clubsNotified = 0;
  let emailsSent = 0;

  for (const org of organizations) {
    const alerts = await computeMemberAlerts(org.id);
    if (alerts.length === 0) continue;

    const admins = await db
      .select({ userId: user.id })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(and(eq(member.organizationId, org.id), inArray(member.role, ["owner", "admin"])));

    // An admin created by "add member" may still carry a technical address: resolve the real one.
    const contactEmails = await resolveContactEmails(
      org.id,
      admins.map((a) => a.userId),
    );
    const orgAdminEmails = [
      ...new Set([...contactEmails.values()].filter((e): e is string => !!e).map((e) => e.trim())),
    ];
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
