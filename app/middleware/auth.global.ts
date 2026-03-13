export default defineNuxtRouteMiddleware(async (to) => {
  // Redirect old /my-decks to profile page
  if (to.path === '/my-decks') {
    const { useSession } = useAuth()
    const session = useSession()
    if (session.value?.data?.user) {
      return navigateTo(`/profile/${session.value.data.user.id}`)
    }
    return navigateTo('/login')
  }

  const protectedRoutes = ['/dashboard']

  if (!protectedRoutes.some(route => to.path.startsWith(route))) {
    return
  }

  const { useSession } = useAuth()
  const session = useSession()

  if (!session.value?.data) {
    return navigateTo('/login')
  }
})
