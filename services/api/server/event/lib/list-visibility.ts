export type EventListScope =
  | { kind: "forbidden" }
  | {
      kind: "ok";
      /** Super-admin: no access condition at all. */
      unrestricted: boolean;
      /** Club ids whose events the caller may list. */
      organizationIds: string[];
      /** Events with no club (the only ones "public" still applies to). */
      includeClublessEvents: boolean;
    };

/**
 * Which events a caller may list. An event attached to a club is only listed for that club's
 * members whatever its `visibility` says; asking for a club you are not in is refused (403).
 * Without an explicit club, every club of the caller is listed (never anything wider).
 */
export function buildEventListScope(input: {
  isSuperAdmin: boolean;
  clubIds: readonly string[];
  requestedOrganizationId?: string | null;
}): EventListScope {
  if (input.isSuperAdmin) {
    return { kind: "ok", unrestricted: true, organizationIds: [], includeClublessEvents: true };
  }
  const requested = input.requestedOrganizationId;
  if (requested) {
    if (!input.clubIds.includes(requested)) return { kind: "forbidden" };
    return { kind: "ok", unrestricted: false, organizationIds: [requested], includeClublessEvents: false };
  }
  return {
    kind: "ok",
    unrestricted: false,
    organizationIds: [...new Set(input.clubIds)],
    includeClublessEvents: true,
  };
}
