import { createAuthClient } from 'better-auth/vue'

const authClient = createAuthClient()

export function useAuth() {
  return authClient
}
