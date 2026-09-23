import { evaluateConditions } from "./conditions";
import type { BaseLine, MemberPricingProfile, TarifGridSnapshot } from "./types";

export interface BuildBaseLinesResult {
  lines: BaseLine[];
  missingFields: string[];
}

/**
 * Step 2 of the engine: base lines (membership, license, lessons, eligible additional lines)
 * before any rule is applied. Also surfaces any profile field needed to build these lines but
 * absent from `profile` (added to `missingFields`) — it does NOT throw or silently default to a
 * full price.
 */
export function buildBaseLines(
  grid: TarifGridSnapshot,
  categoryId: string,
  profile: MemberPricingProfile,
  ctx: { ageAtReference: number },
): BuildBaseLinesResult {
  const missingFields: string[] = [];
  const lines: BaseLine[] = [];
  const baseRate = grid.baseRates.find((r) => r.categoryId === categoryId);

  const membershipFeeCents = baseRate?.membershipFeeCents ?? 0;
  lines.push({ key: "membership", label: "Adhésion", targetType: "membership", baseAmountCents: membershipFeeCents });

  // The license line only needs `licensedElsewhere` when the grid actually charges a license fee
  // for this category — otherwise the datum is irrelevant to the calculation.
  const licenseFeeFull = baseRate?.licenseFeeCents ?? 0;
  let licenseFeeCents = licenseFeeFull;
  if (licenseFeeFull > 0 && profile.licensedElsewhere === undefined) {
    missingFields.push("licensedElsewhere");
  } else if (profile.licensedElsewhere === true) {
    licenseFeeCents = 0;
  }
  lines.push({ key: "license", label: "Licence", targetType: "license", baseAmountCents: licenseFeeCents });

  // Lessons: only required when the grid actually has a lesson-price table for this category.
  const lessonRatesForCategory = grid.lessonRates.filter((r) => r.categoryId === categoryId);
  let lessonsAmountCents = 0;
  if (lessonRatesForCategory.length > 0) {
    if (profile.lessonsPerWeek === undefined) {
      missingFields.push("lessonsPerWeek");
    } else {
      const requestedLessons = Math.min(profile.lessonsPerWeek, 4); // 4 = "4 ou plus"
      const lessonRate = lessonRatesForCategory.find((r) => r.lessonsPerWeek === requestedLessons);
      lessonsAmountCents = lessonRate?.priceCents ?? 0;
    }
  }
  lines.push({ key: "lessons", label: "Cours", targetType: "lessons", baseAmountCents: lessonsAmountCents });

  for (const additional of grid.additionalLines) {
    if (!additional.isActive) continue;
    const result = evaluateConditions(additional.conditions, profile, {
      resolvedCategoryId: categoryId,
      ageAtReference: ctx.ageAtReference,
    });
    if ("missing" in result) {
      missingFields.push(...result.missing);
      continue;
    }
    if (!result.met) continue;
    lines.push({
      key: `additional:${additional.id}`,
      label: additional.name,
      targetType: "additional_line",
      additionalLineId: additional.id,
      baseAmountCents: additional.amountCents,
    });
  }

  return { lines, missingFields };
}
