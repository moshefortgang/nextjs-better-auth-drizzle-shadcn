import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL, // Optional if the API base URL matches the frontend
  plugins: [adminClient()],
})

export const { signIn, signOut, signUp, useSession } = authClient
