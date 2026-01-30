import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { bearer, organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { phoneNumber } from "better-auth/plugins";
import { user as userTable } from "./db/schema/auth/schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  databaseHooks: {

    account: {
      create: {
        after: async (account) => {
          const [linkedUser] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, account.userId))
            .limit(1);

          if (linkedUser && linkedUser.isGhost) {
            await db
              .update(userTable)
              .set({
                isGhost: false,
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
  },
  account: {
    accountLinking: {
      enabled: true,
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
    "aceclub://",
    "https://ace-club-production.up.railway.app",
    "https://appleid.apple.com",
  ],

  plugins: [bearer(), admin(), organization(), phoneNumber()],
});
