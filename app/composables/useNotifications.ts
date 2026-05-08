import type { AppNotification } from '#shared/schemas/notification'

const POLL_INTERVAL_MS = 30_000

export function useNotifications() {
  const { useSession } = useAuth()
  const session = useSession()

  const notificationList = ref<AppNotification[]>([])

  let pollTimer: ReturnType<typeof setInterval> | null = null

  async function fetchNotifications() {
    if (!session.value?.data?.user) return
    try {
      notificationList.value = await $fetch<AppNotification[]>('/api/notifications')
    } catch { /* empty */ }
  }

  async function markAllAsRead() {
    await $fetch('/api/notifications/read-all', { method: 'PUT' })
  }

  onMounted(() => {
    fetchNotifications()
    pollTimer = setInterval(fetchNotifications, POLL_INTERVAL_MS)
  })

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
  })

  return { notificationList, fetch: fetchNotifications, markAllAsRead }
}
