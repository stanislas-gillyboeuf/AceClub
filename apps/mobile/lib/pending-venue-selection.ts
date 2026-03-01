import type { Organization } from "@/types/organization";

let pending: Organization | null = null;

export function setPendingVenueSelection(venue: Organization | null) {
  pending = venue;
}

export function consumePendingVenueSelection(): Organization | null {
  const result = pending;
  pending = null;
  return result;
}
