import { createAuthClient } from "better-auth/react"
import { organizationClient, adminClient, phoneNumberClient,inferOrgAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "../../../../services/api/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001",
  plugins: [organizationClient({
        schema: inferOrgAdditionalFields<typeof auth>(),
      }

  ), adminClient(), phoneNumberClient()],
})

export const { signIn, signOut, useSession, getSession } = authClient
