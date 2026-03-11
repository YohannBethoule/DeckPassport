<script setup lang="ts">
import type { ManaColor } from '#shared/schemas/commander'

defineProps<{
  modelValue: ManaColor[]
  colorOptions: { label: string, value: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ManaColor[]]
}>()
</script>

<template>
  <UFormField
    label="Colors"
    name="colors"
    required
  >
    <USelectMenu
      :model-value="modelValue"
      :items="colorOptions"
      value-key="value"
      multiple
      placeholder="Select color identity"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event as ManaColor[])"
    >
      <template #item-leading="{ item }">
        <IconsWhiteMana
          v-if="item?.value === 'W'"
          class="size-5"
        />
        <IconsBlueMana
          v-else-if="item?.value === 'U'"
          class="size-5"
        />
        <IconsBlackMana
          v-else-if="item?.value === 'B'"
          class="size-5"
        />
        <IconsRedMana
          v-else-if="item?.value === 'R'"
          class="size-5"
        />
        <IconsGreenMana
          v-else-if="item?.value === 'G'"
          class="size-5"
        />
        <IconsColorlessMana
          v-else-if="item?.value === 'C'"
          class="size-5"
        />
      </template>
    </USelectMenu>
  </UFormField>
</template>
