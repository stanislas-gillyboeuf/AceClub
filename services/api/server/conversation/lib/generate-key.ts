import { randomBytes } from "crypto";

export function generateConversationKey(): string {
  return randomBytes(32).toString("base64");
}
