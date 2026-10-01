import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { bearer, organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { phoneNumber } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { user as userTable, member as memberTable } from "./db/schema/auth/schema";
import { userPreference } from "./db/schema/user-preference/schema";
import { asc, eq } from "drizzle-orm";
import { invalidateAllUserClubIds, invalidateUserClubIds } from "./lib/club-access";
import { awardPremiersPasBadge } from "./server/reward/services/badge-service";
import { expo } from "@better-auth/expo";
import { sendEmail } from "./services/mailer";
import { resetPasswordEmail, emailVerificationOtpEmail } from "./services/mailer/templates";

/** Best-effort: records how a Better-Auth-managed membership came to exist (member.source has
 * no default — see db/schema/auth/schema.ts). Never throws, this is metadata, not the write
 * the hook is actually there for. */
async function setMemberSource(memberId: string, source: "admin_added" | "invitation") {
  try {
    await db.update(memberTable).set({ source }).where(eq(memberTable.id, memberId));
  } catch (error) {
    console.error(`[AUTH] Failed to set member ${memberId} source to ${source}:`, error);
  }
}

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
          // Deterministic active club: the user's preferred club when they are still a member of
          // it, otherwise their oldest membership.
          const memberships = await db
            .select()
            .from(memberTable)
            .where(eq(memberTable.userId, session.userId))
            .orderBy(asc(memberTable.createdAt));

          if (memberships.length > 0) {
            const [pref] = await db
              .select({ organizationId: userPreference.organizationId })
              .from(userPreference)
              .where(eq(userPreference.userId, session.userId))
              .limit(1);
            const active =
              memberships.find((m) => m.organizationId === pref?.organizationId) ?? memberships[0];
            return {
              data: {
                ...session,
                activeOrganizationId: active.organizationId,
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
      gender: {
        type: "string",
        fieldName: "gender",
        input: true,
        required: false,
      },
      dateOfBirth: {
        type: "string",
        fieldName: "date_of_birth",
        input: true,
        required: false,
      },
      mustChangePassword: {
        type: "boolean",
        fieldName: "must_change_password",
        defaultValue: false,
        input: true,
      },
      contactEmail: {
        type: "string",
        fieldName: "contact_email",
        input: true,
        required: false,
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
      const email = resetPasswordEmail({ resetUrl: url });
      await sendEmail({
        to: user.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
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
    "http://10.0.2.2:3000",
    "aceclub://",
    "mobile://",
    "https://ace-club-production.up.railway.app",
    "https://ace-club.app",
    "https://appleid.apple.com",
    process.env.NGROK_URL || "",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://192.168.1.23:8081", "exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ].filter(Boolean),

  // Membership writes must go through our own routes (they enforce who may add whom). The
  // Better Auth handlers for these two would let ANY signed-in user add anyone to any club as
  // owner / create clubs; auth.api.* calls made by our handlers are unaffected by this list.
  disabledPaths: ["/organization/add-member", "/organization/create"],

  plugins: [
    expo(),
    bearer(),
    admin(),
    organization({
      // Safety net for every membership write that goes through Better Auth (including the
      // direct /api/auth/organization/* endpoints): the cached club list must never go stale.
      organizationHooks: {
        afterAddMember: async ({ member }) => {
          await setMemberSource(member.id, "admin_added");
          await invalidateUserClubIds(member.userId);
        },
        afterRemoveMember: async ({ member }) => invalidateUserClubIds(member.userId),
        afterUpdateMemberRole: async ({ member }) => invalidateUserClubIds(member.userId),
        afterAcceptInvitation: async ({ member }) => {
          await setMemberSource(member.id, "invitation");
          await invalidateUserClubIds(member.userId);
        },
        afterCreateOrganization: async ({ member, user }) => {
          if (member) await setMemberSource(member.id, "admin_added");
          await invalidateUserClubIds(member?.userId, user?.id);
        },
        afterDeleteOrganization: async () => invalidateAllUserClubIds(),
      },
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
            onboardingCompleted: {
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
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      allowedAttempts: 5,
      changeEmail: {
        // Apple's relay email already counts as emailVerified (Apple vouches for it), so this
        // flow is how a relay user swaps it for the real address they type on /apple-email
        // (apps/mobile/app/(auth)/apple-email.tsx).
        enabled: true,
        verifyCurrentEmail: true,
      },
      sendVerificationOTP: async ({ email, otp, type }) => {
        const content = emailVerificationOtpEmail({ otp, type });
        await sendEmail({
          to: email,
          subject: content.subject,
          html: content.html,
          text: content.text,
        });
      },
    }),
  ],
});
