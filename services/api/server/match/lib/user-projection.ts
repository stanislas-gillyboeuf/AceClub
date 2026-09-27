/**
 * The only user fields a match response may expose. The full `user` row carries email, phone,
 * date of birth, gender, role and ban data, none of which belongs in a match feed.
 */
export interface MatchUserPublic {
  id: string;
  name: string;
  image: string | null;
}

export function projectMatchUser(
  row: { id: string; name: string; image?: string | null } | null | undefined,
): MatchUserPublic | null {
  if (!row) return null;
  return { id: row.id, name: row.name, image: row.image ?? null };
}
