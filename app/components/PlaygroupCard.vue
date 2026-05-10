<script setup lang="ts">
import type { PlaygroupSummary } from '#shared/schemas/playgroup'

const { playgroup } = defineProps<{
  playgroup: PlaygroupSummary
}>()
</script>

<template>
  <UPageCard
    variant="ghost"
    :to="`/playgroups/${playgroup.id}`"
  >
    <template #body>
      <div class="flex items-center gap-3">
        <img
          v-if="playgroup.imageUrl"
          :src="playgroup.imageUrl"
          :alt="playgroup.name"
          class="size-10 rounded-full object-cover shrink-0"
        >
        <UIcon
          v-else
          name="i-lucide-shield"
          class="size-8 text-primary shrink-0"
        />
        <div>
          <p class="font-semibold">
            {{ playgroup.name }}
          </p>
          <p class="text-sm text-muted">
            {{ playgroup.memberCount }} member{{ playgroup.memberCount !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
    </template>
  </UPageCard>
</template>
