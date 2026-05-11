<script setup lang="ts">
defineProps<{
  label: string
  description?: string
}>()

const isTouchOnly = ref(false)
const isOpen = ref(false)

onMounted(() => {
  isTouchOnly.value = window.matchMedia('(hover: none)').matches
})

function interceptClick(e: MouseEvent) {
  e.stopImmediatePropagation()
}
</script>

<template>
  <span class="flex w-full min-w-0 items-center gap-1.5">
    <span class="min-w-0 flex-1 truncate">{{ label }}</span>
    <UPopover
      v-if="description"
      :open="isOpen"
      :content="{ side: isTouchOnly ? 'bottom' : 'right', sideOffset: 8, collisionPadding: 12 }"
      @update:open="isOpen = $event"
    >
      <button
        type="button"
        aria-label="More info"
        class="shrink-0 text-muted hover:text-default focus-visible:outline-none"
        @pointerdown.stop
        @pointerup.stop
        @click.capture="interceptClick"
        @mouseenter="() => { if (!isTouchOnly) isOpen = true }"
        @mouseleave="() => { if (!isTouchOnly) isOpen = false }"
        @touchend.stop.prevent="isOpen = !isOpen"
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
