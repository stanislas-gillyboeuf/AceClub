import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { bearer, organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { phoneNumber } from "better-auth/plugins";
import { user as userTable, member as memberTable } from "./db/schema/auth/schema";
import { eq } from "drizzle-orm";
import { awardPremiersPasBadge } from "./server/reward/services/badge-service";
import { Resend } from "resend";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await awardPremiersPasBadge(user.id);
          } catch (error) {
            console.error(`[AUTH] Failed to award premiers_pas badge to user ${user.id}:`, error);
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const [firstMembership] = await db
            .select()
            .from(memberTable)
            .where(eq(memberTable.userId, session.userId))
            .limit(1);

          if (firstMembership) {
            return {
              data: {
                ...session,
                activeOrganizationId: firstMembership.organizationId,
              },
            };
          }
          return { data: session };
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          const [linkedUser] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, account.userId))
            .limit(1);

          if (linkedUser && linkedUser.is_ghost) {
            await db
              .update(userTable)
              .set({
                is_ghost: false,
                updatedAt: new Date(),
              })
              .where(eq(userTable.id, account.userId));
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      onboardingCompleted: {
        type: "boolean",
        fieldName: "onboarding_completed",
        defaultValue: false,
        input: true,
      },
      isGhost: {
        type: "boolean",
        fieldName: "is_ghost",
        defaultValue: false,
        input: true,
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const resend = new Resend(process.env.RESEND_API_KEY);
      void resend.emails.send({
        from: "AceClub <noreply@aceclub.app>",
        to: [user.email],
        subject: "Réinitialisez votre mot de passe - AceClub",
        html: `
          <h2>Bonjour ${user.name || ""},</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe AceClub.</p>
          <p><a href="${url}" style="display:inline-block;padding:12px 24px;background-color:#16a34a;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Réinitialiser mon mot de passe</a></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <p>Ce lien expire dans 1 heure.</p>
          <p>L'équipe AceClub</p>
        `,
        text: `Bonjour ${user.name || ""},\n\nVous avez demandé la réinitialisation de votre mot de passe AceClub.\n\nCliquez sur ce lien pour réinitialiser : ${url}\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.\nCe lien expire dans 1 heure.\n\nL'équipe AceClub`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID as string,
      clientSecret: process.env.APPLE_CLIENT_SECRET as string,
      appBundleIdentifier: "dev.aceclub.app",
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "aceclub://",
    "https://ace-club-production.up.railway.app",
    "https://ace-club.app",
    "https://appleid.apple.com",
    process.env.NGROK_URL || "",
  ].filter(Boolean),

  plugins: [
    bearer(),
    admin(),
    organization({
      schema: {
        organization: {
          additionalFields: {
            address: {
              type: "string",
              input: true,
              required: false,
            },
            latitude: {
              type: "number",
              input: true,
              required: false,
            },
            longitude: {
              type: "number",
              input: true,
              required: false,
            },
            pin: {
              type: "string",
              input: false,
              required: false,
            },
            pinEnabled: {
              type: "boolean",
              input: false,
              required: false,
              defaultValue: false,
            },
          },
        },
      },
    }),
    phoneNumber(),
  ],
});
