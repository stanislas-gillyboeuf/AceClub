import type { ChatMessage, GroupPosition } from "../types";
import type { Conversation } from "@/types/conversation";

export function getDisplayName(conversation: Conversation): string {
  if (conversation.name) return conversation.name;
  return conversation.otherParticipants[0]?.user?.name ?? "Conversation";
}

export function getAvatarUrl(conversation: Conversation): string | null {
  return conversation.otherParticipants[0]?.user?.image ?? null;
}

// Message grouping: same sender + < 60s apart
// Data is sorted oldest-first (index 0 = oldest, index N = newest)
export function getMessageGroupPosition(
  messages: ChatMessage[],
  index: number,
): GroupPosition {
  const message = messages[index];
  const older = index > 0 ? messages[index - 1] : null;
  const newer = index < messages.length - 1 ? messages[index + 1] : null;

  const isSameSenderAsNewer =
    newer &&
    newer.senderId === message.senderId &&
    Math.abs(new Date(message.createdAt).getTime() - new Date(newer.createdAt).getTime()) < 60000;

  const isSameSenderAsOlder =
    older &&
    older.senderId === message.senderId &&
    Math.abs(new Date(message.createdAt).getTime() - new Date(older.createdAt).getTime()) < 60000;

  if (isSameSenderAsNewer && isSameSenderAsOlder) return "middle";
  if (isSameSenderAsNewer && !isSameSenderAsOlder) return "first";
  if (!isSameSenderAsNewer && isSameSenderAsOlder) return "last";
  return "single";
}

// Time separator: show when gap > 5 minutes from previous (older) message
// Data is sorted oldest-first (index 0 = oldest)
export function shouldShowTimeSeparator(
  messages: ChatMessage[],
  index: number,
): boolean {
  const older = index > 0 ? messages[index - 1] : null;
  if (!older) return true; // First message in history
  const diff = Math.abs(
    new Date(messages[index].createdAt).getTime() - new Date(older.createdAt).getTime(),
  );
  return diff > 300000; // 5 minutes
}

export function formatTimeSeparator(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) return `Aujourd'hui ${time}`;
  if (diffDays === 1) return `Hier ${time}`;
  if (diffDays < 7) {
    const day = date.toLocaleDateString("fr-FR", { weekday: "long" });
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${time}`;
  }
  return `${date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} ${time}`;
}

// For inverted FlatList: data is newest-first (index 0 = newest)
// Older message is at index + 1, newer is at index - 1
export function getMessageGroupPositionInverted(
  messages: ChatMessage[],
  index: number,
): GroupPosition {
  const message = messages[index];
  const older = index < messages.length - 1 ? messages[index + 1] : null;
  const newer = index > 0 ? messages[index - 1] : null;

  const isSameSenderAsNewer =
    newer &&
    newer.senderId === message.senderId &&
    Math.abs(new Date(message.createdAt).getTime() - new Date(newer.createdAt).getTime()) < 60000;

  const isSameSenderAsOlder =
    older &&
    older.senderId === message.senderId &&
    Math.abs(new Date(message.createdAt).getTime() - new Date(older.createdAt).getTime()) < 60000;

  if (isSameSenderAsNewer && isSameSenderAsOlder) return "middle";
  if (isSameSenderAsNewer && !isSameSenderAsOlder) return "first";
  if (!isSameSenderAsNewer && isSameSenderAsOlder) return "last";
  return "single";
}

export function shouldShowTimeSeparatorInverted(
  messages: ChatMessage[],
  index: number,
): boolean {
  const older = index < messages.length - 1 ? messages[index + 1] : null;
  if (!older) return true;
  const diff = Math.abs(
    new Date(messages[index].createdAt).getTime() - new Date(older.createdAt).getTime(),
  );
  return diff > 300000;
}

export function formatDeliveryStatus(status: string): string {
  switch (status) {
    case "sending":
      return "Envoi\u2026";
    case "sent":
      return "Envoy\u00e9";
    case "read":
      return "Lu";
    default:
      return "";
  }
}
