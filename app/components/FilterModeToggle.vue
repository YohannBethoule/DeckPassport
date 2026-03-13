<script setup lang="ts">
import type { FilterMode } from '#shared/schemas/filter'
import { FILTER_MODES } from '#shared/schemas/filter'

withDefaults(defineProps<{
  modelValue: FilterMode
  includingLabel?: string
  onlyLabel?: string
}>(), {
  includingLabel: 'Including',
  onlyLabel: 'Only'
})

const emit = defineEmits<{
  'update:modelValue': [value: FilterMode]
}>()

const [includingMode, onlyMode] = FILTER_MODES
</script>

<template>
  <div class="flex items-center gap-1">
    <UButton
      :label="includingLabel"
      size="xs"
      :variant="modelValue === includingMode ? 'solid' : 'ghost'"
      :color="modelValue === includingMode ? 'primary' : 'neutral'"
      @click="emit('update:modelValue', includingMode)"
    />
    <UButton
      :label="onlyLabel"
      size="xs"
      :variant="modelValue === onlyMode ? 'solid' : 'ghost'"
      :color="modelValue === onlyMode ? 'primary' : 'neutral'"
      @click="emit('update:modelValue', onlyMode)"
    />
  </div>
</template>
