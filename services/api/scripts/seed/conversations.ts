import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { eq } from "drizzle-orm";
import {
  conversation,
  conversationParticipant,
  message,
  match,
} from "../../db/schema/index.js";
import type { Database } from "./context.js";

const TENNIS_MESSAGES_FR = [
  "Super match aujourd'hui !",
  "Bien joué, ton revers s'est vachement amélioré !",
  "On remet ça quand tu veux",
  "Merci pour le match, c'était intense",
  "Belle victoire, tu m'as pas laissé beaucoup de chances 😄",
  "La prochaine fois je te bats !",
  "Ton service était vraiment dur à retourner",
  "GG ! C'était serré jusqu'au bout",
  "J'ai bien aimé ce match, on progresse tous les deux",
  "Faut qu'on rejoue cette semaine",
  "T'étais en forme aujourd'hui !",
  "Le tie-break était vraiment stressant",
  "Bien joué, c'est toujours un plaisir de jouer avec toi",
  "Mon coup droit me lâche en ce moment, faut que je bosse ça",
  "Prochain match mardi ça te dit ?",
  "C'était un super échange au filet !",
  "Tu gères vraiment bien les balles courtes",
  "Allez, revanche la semaine prochaine !",
];

export async function seedConversations(
  db: Database,
  ctx: {
    matchData: Array<{
      id: string;
      status: string;
      startedAt: Date | null;
      homeUserId: string;
      awayUserId: string;
    }>;
  },
): Promise<void> {
  let convCount = 0;
  let msgCount = 0;

  for (const m of ctx.matchData) {
    // Only finished and ongoing matches get conversations
    if (m.status === "scheduled") continue;

    const convId = ulid();
    const baseTime = m.startedAt ?? new Date();

    // Create conversation
    const messageCount = faker.number.int({ min: 2, max: 5 });
    const messages: Array<{
      id: string;
      conversationId: string;
      senderId: string;
      content: string;
      createdAt: Date;
    }> = [];

    for (let i = 0; i < messageCount; i++) {
      const senderId = i % 2 === 0 ? m.homeUserId : m.awayUserId;
      const content = faker.helpers.arrayElement(TENNIS_MESSAGES_FR);
      const msgTime = new Date(baseTime.getTime() + (i + 1) * 5 * 60 * 1000);

      messages.push({
        id: ulid(),
        conversationId: convId,
        senderId,
        content,
        createdAt: msgTime,
      });
    }

    const lastMsg = messages[messages.length - 1];

    await db.insert(conversation).values({
      id: convId,
      type: "match",
      lastMessageAt: lastMsg.createdAt,
      lastMessagePreview: lastMsg.content,
      lastMessageSenderId: lastMsg.senderId,
    });

    // Create participants
    await db.insert(conversationParticipant).values([
      { id: ulid(), conversationId: convId, userId: m.homeUserId },
      { id: ulid(), conversationId: convId, userId: m.awayUserId },
    ]);

    // Create messages
    await db.insert(message).values(messages);

    // Link conversation to match
    await db
      .update(match)
      .set({ conversationId: convId })
      .where(eq(match.id, m.id));

    convCount++;
    msgCount += messages.length;
  }

  console.log(`  Inserted ${convCount} conversations with ${msgCount} messages`);
}
