import { randomBytes } from "node:crypto";

/** Opaque, unguessable token for a shareable profile link — not the row id, not sequential. */
export function generateShareToken(): string {
  return randomBytes(24).toString("base64url");
}
