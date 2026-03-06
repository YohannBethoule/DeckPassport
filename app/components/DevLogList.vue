<script setup lang="ts">
export interface DevLogItem {
  title: string
  description?: string
  icon?: string
}

defineProps<{
  items: DevLogItem[]
}>()
</script>

<template>
  <UPageGrid>
    <UPageCard
      v-for="item in items"
      :key="item.title"
      :title="item.title"
      :description="item.description"
      :icon="item.icon"
      variant="soft"
    />
  </UPageGrid>
</template>
