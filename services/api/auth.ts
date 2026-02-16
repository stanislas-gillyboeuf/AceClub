import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { bearer, organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { phoneNumber } from "better-auth/plugins";
import { user as userTable, member as memberTable } from "./db/schema/auth/schema";
import { eq } from "drizzle-orm";
import { awardPremiersPasBadge } from "./server/reward/services/badge-service";
import { expo } from "@better-auth/expo";

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
    "http://10.0.2.2:3000",
    "aceclub://",
    "mobile://",
    "https://ace-club-production.up.railway.app",
    "https://ace-club.app",
    "https://appleid.apple.com",
    process.env.NGROK_URL || "",
    ...(process.env.NODE_ENV === "development" ? [
      "exp://192.168.1.23:8081",
      "exp://",
      "exp://**",
      "exp://192.168.*.*:*/**",
    ] : []),
  ].filter(Boolean),

  plugins: [
    expo(),
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
