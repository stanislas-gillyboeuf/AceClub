import { createAuthClient } from "better-auth/react"
import { organizationClient, adminClient, phoneNumberClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001",
  plugins: [organizationClient({
        schema: {
          organization: {
            additionalFields: {
              address: { type: "string", required: false },
              latitude: { type: "number", required: false },
              longitude: { type: "number", required: false },
            },
          },
        },
      }
  ), adminClient(), phoneNumberClient()],
})

export const { signIn, signOut, useSession, getSession } = authClient
