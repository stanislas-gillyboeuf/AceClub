import { createAuthClient } from "better-auth/react"
import { organizationClient, adminClient, phoneNumberClient } from "better-auth/client/plugins"

const TOKEN_KEY = "bearer_token"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001",
  plugins: [organizationClient(), adminClient(), phoneNumberClient()],
})

export const { signIn, signOut, useSession, getSession } = authClient
