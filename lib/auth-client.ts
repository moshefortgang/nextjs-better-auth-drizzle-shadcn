import { createAuthClient } from "better-auth/react"
 
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL, // Optional if the API base URL matches the frontend
})
 
export const { signIn, signOut, signUp, useSession } = authClient