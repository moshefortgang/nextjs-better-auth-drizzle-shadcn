import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

// No baseURL: the auth API is served by this app, so the client uses the page's origin.
// That keeps the client bundle port-independent (E2E builds on 3100 also run on 3000).
export const authClient = createAuthClient({
  plugins: [adminClient()],
})

export const { signIn, signOut, signUp, useSession } = authClient
