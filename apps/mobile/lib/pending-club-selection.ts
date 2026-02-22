import type { Organization } from "@/types/organization";

type ClubSelection = { organization: Organization; pin?: string } | null;

let pending: ClubSelection = null;

export function setPendingClubSelection(selection: ClubSelection) {
  pending = selection;
}

export function consumePendingClubSelection(): ClubSelection {
  const result = pending;
  pending = null;
  return result;
}

