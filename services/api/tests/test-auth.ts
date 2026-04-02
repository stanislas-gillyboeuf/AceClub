import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { bearer, organization, testUtils } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { phoneNumber } from "better-auth/plugins";
import { expo } from "@better-auth/expo";

export const testAuth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
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
  trustedOrigins: ["http://localhost:3000"],
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
    testUtils(),
  ],
});
