export default defineNuxtRouteMiddleware(async (to) => {
  const protectedRoutes = ['/dashboard', '/my-decks']

  if (!protectedRoutes.some(route => to.path.startsWith(route))) {
    return
  }

  const { useSession } = useAuth()
  const session = useSession()

  if (!session.value?.data) {
    return navigateTo('/login')
  }
})
