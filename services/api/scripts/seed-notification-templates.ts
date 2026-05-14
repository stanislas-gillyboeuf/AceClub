import "dotenv/config";
import { db } from "../db";
import {
  notificationTemplate,
  notificationTemplateVariant,
} from "../db/schema/notification/schema";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import type { NotificationType } from "../services/expo-push/notification-service";

type SeedVariant = { title: string; body: string };
type SeedTemplate = {
  type: NotificationType;
  description: string;
  availableVariables: string[];
  variants: SeedVariant[];
};

const TEMPLATES: SeedTemplate[] = [
  {
    type: "match_request_accepted",
    description: "Envoyée au demandeur quand un joueur accepte sa demande de match.",
    availableVariables: ["accepterName"],
    variants: [
      {
        title: "Match confirmé ! 🎾",
        body: "Top ! {{accepterName}} a accepté ton match",
      },
      {
        title: "On joue ! 💪",
        body: "{{accepterName}} a dit oui à ton match. Prépare ta raquette !",
      },
      {
        title: "Demande acceptée 🔥",
        body: "Ça matche avec {{accepterName}} — à toi de jouer !",
      },
    ],
  },
  {
    type: "invitation_accepted",
    description: "Envoyée à l'inviteur quand un membre rejoint son club.",
    availableVariables: ["memberName", "organizationName"],
    variants: [
      {
        title: "Nouveau membre ! 🙌",
        body: "{{memberName}} a rejoint {{organizationName}}",
      },
      {
        title: "Bienvenue à bord 🎉",
        body: "{{memberName}} fait maintenant partie de {{organizationName}}",
      },
    ],
  },
  {
    type: "new_match_request",
    description: "Envoyée quand un joueur reçoit une nouvelle demande de match.",
    availableVariables: ["requesterName"],
    variants: [
      {
        title: "Nouvelle demande 🎾",
        body: "{{requesterName}} t'a envoyé une demande de match",
      },
      {
        title: "Quelqu'un veut jouer 🏓",
        body: "{{requesterName}} aimerait croiser le fer avec toi",
      },
    ],
  },
  {
    type: "match_reminder",
    description: "Rappel envoyé avant un match programmé.",
    availableVariables: ["matchTime", "opponentName"],
    variants: [
      {
        title: "Rappel de match ⏰",
        body: "Ton match {{matchTime}} approche, n'oublie pas !",
      },
      {
        title: "C'est bientôt 🎾",
        body: "RDV {{matchTime}} face à {{opponentName}}",
      },
    ],
  },
  {
    type: "challenge_assigned",
    description: "Envoyée chaque lundi quand de nouveaux défis sont attribués.",
    availableVariables: [],
    variants: [
      {
        title: "Nouveaux défis de la semaine 🎯",
        body: "Tes défis hebdomadaires sont disponibles. Relève-les pour gagner des Aces !",
      },
      {
        title: "C'est parti pour la semaine 💥",
        body: "Tes nouveaux défis t'attendent. À l'attaque !",
      },
      {
        title: "Défis débloqués 🔓",
        body: "Une nouvelle salve de défis vient d'arriver — gagne un max d'Aces.",
      },
    ],
  },
  {
    type: "streak_warning",
    description: "Envoyée le vendredi aux joueurs qui n'ont pas joué cette semaine.",
    availableVariables: ["currentStreak"],
    variants: [
      {
        title: "Ton streak est en danger 🔥",
        body: "Psss, t'as pas encore joué cette semaine ! Tu risques de perdre ta série de {{currentStreak}} semaines",
      },
      {
        title: "Ne casse pas la série 🙏",
        body: "{{currentStreak}} semaines d'affilée, ce serait dommage de tout perdre. Un match ce week-end ?",
      },
    ],
  },
  {
    type: "new_message",
    description: "Envoyée quand un joueur reçoit un nouveau message en conversation.",
    availableVariables: ["senderName", "messagePreview"],
    variants: [
      {
        title: "{{senderName}}",
        body: "{{messagePreview}}",
      },
    ],
  },
  {
    type: "match_liked",
    description: "Envoyée aux participants quand quelqu'un like leur match.",
    availableVariables: ["likerName"],
    variants: [
      {
        title: "Nouveau like ❤️",
        body: "{{likerName}} a aimé votre match",
      },
      {
        title: "Ça plait à {{likerName}} 👏",
        body: "Votre match récolte un nouveau like",
      },
    ],
  },
];

async function main() {
  console.log("Seeding notification templates...\n");

  for (const tpl of TEMPLATES) {
    const [existing] = await db
      .select({ id: notificationTemplate.id })
      .from(notificationTemplate)
      .where(eq(notificationTemplate.type, tpl.type))
      .limit(1);

    let templateId: string;
    if (existing) {
      await db
        .update(notificationTemplate)
        .set({
          description: tpl.description,
          availableVariables: tpl.availableVariables,
          isActive: true,
        })
        .where(eq(notificationTemplate.id, existing.id));
      templateId = existing.id;
      console.log(`Updated template ${tpl.type}`);
    } else {
      const [created] = await db
        .insert(notificationTemplate)
        .values({
          id: ulid(),
          type: tpl.type,
          description: tpl.description,
          availableVariables: tpl.availableVariables,
          isActive: true,
        })
        .returning({ id: notificationTemplate.id });
      templateId = created.id;
      console.log(`Created template ${tpl.type}`);
    }

    // Only seed variants if the template currently has none — never overwrite
    // admin edits made via the dashboard.
    const variants = await db
      .select({ id: notificationTemplateVariant.id })
      .from(notificationTemplateVariant)
      .where(eq(notificationTemplateVariant.templateId, templateId))
      .limit(1);

    if (variants.length === 0) {
      for (const variant of tpl.variants) {
        await db.insert(notificationTemplateVariant).values({
          id: ulid(),
          templateId,
          title: variant.title,
          body: variant.body,
          isActive: true,
        });
      }
      console.log(`  Seeded ${tpl.variants.length} variant(s)`);
    } else {
      console.log(`  Already has variants, skipping`);
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
