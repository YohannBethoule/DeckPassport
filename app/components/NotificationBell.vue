<script setup lang="ts">
import { NOTIFICATION_TYPE } from '#shared/schemas/notification'
import type { AppNotification, PlaygroupNotification, SystemNotification } from '#shared/schemas/notification'
import { PLAYGROUP_INVITATION_STATUS } from '#shared/schemas/playgroup'
import { useNotifications } from '~/composables/useNotifications'

const { notificationList, fetch, markAllAsRead } = useNotifications()
const toast = useToast()

const isOpen = ref(false)
watch(isOpen, (open) => {
  if (open && notificationList.value.length > 0) markAllAsRead()
  if (!open) fetch()
})

function isSystem(n: AppNotification): n is SystemNotification {
  return n.type === NOTIFICATION_TYPE.SYSTEM
}

function isPlaygroupNotification(n: AppNotification): n is PlaygroupNotification {
  return n.type === NOTIFICATION_TYPE.PLAYGROUP_INVITATION_RECEIVED
    || n.type === NOTIFICATION_TYPE.PLAYGROUP_MEMBER_JOINED
    || n.type === NOTIFICATION_TYPE.PLAYGROUP_DISBANDED
}

function notificationLabel(n: AppNotification): string {
  if (isSystem(n)) return n.title
  if (n.type === NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED) return `${n.actor.name} sent you a friend request`
  if (n.type === NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPTED) return `${n.actor.name} accepted your friend request`
  if (isPlaygroupNotification(n)) {
    if (n.type === NOTIFICATION_TYPE.PLAYGROUP_INVITATION_RECEIVED) return `${n.actor?.name ?? 'Someone'} invited you to join ${n.playgroupName ?? 'a playgroup'}`
    if (n.type === NOTIFICATION_TYPE.PLAYGROUP_MEMBER_JOINED) return `${n.actor?.name ?? 'Someone'} joined ${n.playgroupName ?? 'your playgroup'}`
    if (n.type === NOTIFICATION_TYPE.PLAYGROUP_DISBANDED) return `${n.playgroupName ?? 'A playgroup'} has been disbanded`
  }

  return 'New notification'
}

function destinationFor(n: AppNotification): string | undefined {
  if (isSystem(n)) return n.link ?? undefined
  if (n.type === NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPTED) return `/profile/${n.actor.id}`
  if (n.type === NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED) return '/social'
  if (n.type === NOTIFICATION_TYPE.PLAYGROUP_MEMBER_JOINED) {
    const pg = n as PlaygroupNotification
    return pg.playgroupId ? `/playgroups/${pg.playgroupId}` : undefined
  }
  return undefined
}

function handleClick(n: AppNotification) {
  if (n.type === NOTIFICATION_TYPE.PLAYGROUP_INVITATION_RECEIVED) return
  const dest = destinationFor(n)
  if (dest) navigateTo(dest)
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const processingInvitation = ref<{ id: number, action: 'accept' | 'decline' } | null>(null)

async function handleInvitationResponse(n: PlaygroupNotification, status: typeof PLAYGROUP_INVITATION_STATUS.ACCEPTED | typeof PLAYGROUP_INVITATION_STATUS.REJECTED) {
  if (!n.invitationId) return
  const action = status === PLAYGROUP_INVITATION_STATUS.ACCEPTED ? 'accept' : 'decline'
  processingInvitation.value = { id: n.id, action }
  try {
    await $fetch(`/api/playgroups/invitations/${n.invitationId}`, {
      method: 'PUT',
      body: { status }
    })
    await fetch()
    if (status === PLAYGROUP_INVITATION_STATUS.ACCEPTED && n.playgroupId) {
      await navigateTo(`/playgroups/${n.playgroupId}`)
    }
  } catch {
    toast.add({ color: 'error', title: 'Something went wrong' })
  } finally {
    processingInvitation.value = null
  }
}
</script>

<template>
  <UPopover v-model:open="isOpen">
    <UChip
      :text="String(notificationList.length > 9 ? '9+' : notificationList.length)"
      :show="notificationList.length > 0"
      size="3xl"
    >
      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="ghost"
        aria-label="Notifications"
      />
    </UChip>

    <template #content>
      <div class="w-80">
        <div class="px-4 py-3 border-b border-default">
          <span class="font-medium">Notifications</span>
        </div>

        <div
          v-if="notificationList.length === 0"
          class="px-4 py-6 text-center text-sm text-muted"
        >
          No notifications yet
        </div>

        <ul
          v-else
          class="max-h-96 overflow-y-auto divide-y divide-default"
        >
          <li
            v-for="n in notificationList"
            :key="n.id"
            :class="['flex gap-3 px-4 py-3 bg-elevated/50 hover:bg-elevated transition-colors', n.type !== NOTIFICATION_TYPE.PLAYGROUP_INVITATION_RECEIVED ? 'cursor-pointer' : '']"
            @click="handleClick(n)"
          >
            <template v-if="isSystem(n)">
              <div class="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <UIcon
                  name="i-lucide-bell"
                  class="text-primary w-4 h-4"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">
                  {{ n.title }}
                </p>
                <p class="text-xs text-muted mt-0.5">
                  {{ n.body }}
                </p>
                <p class="text-xs text-muted mt-0.5">
                  {{ timeAgo(n.createdAt) }}
                </p>
              </div>
            </template>
            <template v-else-if="isPlaygroupNotification(n)">
              <div class="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <UIcon
                  name="i-lucide-shield"
                  class="text-primary w-4 h-4"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">
                  {{ notificationLabel(n) }}
                </p>
                <p class="text-xs text-muted mt-0.5">
                  {{ timeAgo(n.createdAt) }}
                </p>
                <div
                  v-if="n.type === NOTIFICATION_TYPE.PLAYGROUP_INVITATION_RECEIVED && n.invitationId"
                  class="flex gap-2 mt-2"
                >
                  <UButton
                    label="Accept"
                    size="xs"
                    :loading="processingInvitation?.id === n.id && processingInvitation?.action === 'accept'"
                    :disabled="processingInvitation?.id === n.id && processingInvitation?.action === 'decline'"
                    @click.stop="handleInvitationResponse(n, PLAYGROUP_INVITATION_STATUS.ACCEPTED)"
                  />
                  <UButton
                    label="Decline"
                    size="xs"
                    color="error"
                    variant="soft"
                    :loading="processingInvitation?.id === n.id && processingInvitation?.action === 'decline'"
                    :disabled="processingInvitation?.id === n.id && processingInvitation?.action === 'accept'"
                    @click.stop="handleInvitationResponse(n, PLAYGROUP_INVITATION_STATUS.REJECTED)"
                  />
                </div>
              </div>
            </template>
            <template v-else>
              <UAvatar
                :src="n.actor.image ?? undefined"
                :alt="n.actor.name"
                size="sm"
                class="shrink-0 mt-0.5"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">
                  {{ notificationLabel(n) }}
                </p>
                <p class="text-xs text-muted mt-0.5">
                  {{ timeAgo(n.createdAt) }}
                </p>
              </div>
            </template>
            <div class="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
          </li>
        </ul>
      </div>
    </template>
  </UPopover>
</template>
