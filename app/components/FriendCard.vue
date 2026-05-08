<script setup lang="ts">
import type { FriendSummary } from '#shared/schemas/social'

const { friend } = defineProps<{
  friend: FriendSummary
}>()
</script>

<template>
  <UPageCard
    variant="ghost"
    :to="'/profile/' + friend.id"
    target="_blank"
  >
    <template #body>
      <UUser
        :name="friend.name"
        :avatar="friend.image ? { src: friend.image } : undefined"
        size="xl"
      />
    </template>
  </UPageCard>
</template>
