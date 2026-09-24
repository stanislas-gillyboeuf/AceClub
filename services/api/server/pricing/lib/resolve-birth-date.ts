import { isValidIsoDate } from "./engine";

/**
 * The club-level date (clubMemberProfile.dateOfBirth) wins over the account-level one. A non-ISO
 * value (legacy raw import such as "31/12/2010") is skipped, falling through to the next source,
 * so the engine reports birthDate as missing instead of computing a nonsense age.
 */
export function resolveBirthDate(
  clubDateOfBirth: string | null | undefined,
  userDateOfBirth: string | null | undefined,
): string | undefined {
  if (clubDateOfBirth && isValidIsoDate(clubDateOfBirth)) return clubDateOfBirth;
  if (userDateOfBirth && isValidIsoDate(userDateOfBirth)) return userDateOfBirth;
  return undefined;
}
