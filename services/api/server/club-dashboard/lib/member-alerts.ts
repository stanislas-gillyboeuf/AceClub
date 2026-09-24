import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { clubMemberProfile, member, memberCotisation, user } from "../../../db/schema";
import { effectiveDueDate } from "../../pricing/lib/due-date";
import { loadSeasonPaymentDueDates } from "../../pricing/lib/active-season";

const EXPIRY_WINDOW_DAYS = 30;

export type MemberAlertType =
  | "license_expired"
  | "license_expiring"
  | "medical_expired"
  | "medical_expiring"
  | "dues_overdue";

export interface MemberAlert {
  userId: string;
  userName: string;
  userImage: string | null;
  type: MemberAlertType;
  detail: string;
  /** Set for `dues_overdue` alerts — identifies the cotisation to remind or mark paid. */
  seasonLabel?: string;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Shared by the homepage "Alertes" card and the daily admin email digest — license and medical
 * certificate expiring/expired, plus overdue cotisations (pending past their effective due date). */
export async function computeMemberAlerts(organizationId: string): Promise<MemberAlert[]> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + EXPIRY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const members = await db
    .select({
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      licenseValidUntil: clubMemberProfile.licenseValidUntil,
      medicalCertificateValidUntil: clubMemberProfile.medicalCertificateValidUntil,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .leftJoin(
      clubMemberProfile,
      and(
        eq(clubMemberProfile.userId, member.userId),
        eq(clubMemberProfile.organizationId, member.organizationId),
      ),
    )
    .where(eq(member.organizationId, organizationId));

  const alerts: MemberAlert[] = [];

  for (const m of members) {
    if (m.licenseValidUntil) {
      if (m.licenseValidUntil < now) {
        alerts.push({
          userId: m.userId,
          userName: m.userName,
          userImage: m.userImage,
          type: "license_expired",
          detail: `Licence expirée le ${formatDate(m.licenseValidUntil)}`,
        });
      } else if (m.licenseValidUntil <= windowEnd) {
        alerts.push({
          userId: m.userId,
          userName: m.userName,
          userImage: m.userImage,
          type: "license_expiring",
          detail: `Licence expire le ${formatDate(m.licenseValidUntil)}`,
        });
      }
    }

    if (m.medicalCertificateValidUntil) {
      if (m.medicalCertificateValidUntil < now) {
        alerts.push({
          userId: m.userId,
          userName: m.userName,
          userImage: m.userImage,
          type: "medical_expired",
          detail: `Certificat médical expiré le ${formatDate(m.medicalCertificateValidUntil)}`,
        });
      } else if (m.medicalCertificateValidUntil <= windowEnd) {
        alerts.push({
          userId: m.userId,
          userName: m.userName,
          userImage: m.userImage,
          type: "medical_expiring",
          detail: `Certificat médical expire le ${formatDate(m.medicalCertificateValidUntil)}`,
        });
      }
    }
  }

  const [pendingCotisations, seasonDueDates] = await Promise.all([
    db
      .select({
        userId: user.id,
        userName: user.name,
        userImage: user.image,
        seasonLabel: memberCotisation.seasonLabel,
        amountCents: memberCotisation.amountCents,
        issuedAt: memberCotisation.issuedAt,
        createdAt: memberCotisation.createdAt,
      })
      .from(memberCotisation)
      .innerJoin(user, eq(memberCotisation.userId, user.id))
      .where(and(eq(memberCotisation.organizationId, organizationId), eq(memberCotisation.status, "pending"))),
    loadSeasonPaymentDueDates(organizationId),
  ]);

  for (const d of pendingCotisations) {
    const dueDate = effectiveDueDate({
      paymentDueDate: seasonDueDates.get(d.seasonLabel) ?? null,
      issuedAt: d.issuedAt,
      createdAt: d.createdAt,
    });
    if (dueDate >= now) continue;
    alerts.push({
      userId: d.userId,
      userName: d.userName,
      userImage: d.userImage,
      type: "dues_overdue",
      detail: `Cotisation ${d.seasonLabel} — ${(d.amountCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} en retard (échéance ${formatDate(dueDate)})`,
      seasonLabel: d.seasonLabel,
    });
  }

  return alerts;
}
