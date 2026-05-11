<script setup lang="ts">
defineProps<{
  label: string
  description?: string
}>()

const isTouchOnly = ref(false)
onMounted(() => {
  isTouchOnly.value = window.matchMedia('(hover: none)').matches
})
</script>

<template>
  <span class="flex w-full min-w-0 items-center gap-1.5">
    <span class="min-w-0 flex-1 truncate">{{ label }}</span>
    <UPopover
      v-if="description"
      :mode="isTouchOnly ? 'click' : 'hover'"
      :open-delay="300"
      :content="{ side: 'right', sideOffset: 8, collisionPadding: 12 }"
    >
      <button
        type="button"
        class="shrink-0 text-muted hover:text-default focus-visible:outline-none"
        @pointerdown.stop
        @pointerup.stop
        @click.stop
      >
        <UIcon
          name="i-lucide-info"
          class="size-3.5"
        />
      </button>
      <template #content>
        <p class="max-w-72 p-2.5 text-xs leading-relaxed">{{ description }}</p>
      </template>
    </UPopover>
  </span>
</template>
