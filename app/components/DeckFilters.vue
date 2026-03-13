<script setup lang="ts">
import type { ManaColor } from '#shared/schemas/commander'
import type { FilterMode } from '#shared/schemas/filter'
import { FILTER_MODES } from '#shared/schemas/filter'

const props = defineProps<{
  total?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string | number | undefined>]
}>()

const defaultFilterMode = FILTER_MODES[0]

const selectedCommanderId = ref<number | undefined>()
const selectedCommanderName = ref('')
const commanderSearchQuery = ref('')
const selectedColors = ref<ManaColor[]>([])
const colorMode = ref<FilterMode>(defaultFilterMode)
const selectedBracketId = ref<number | undefined>()
const selectedArchetypeIds = ref<number[]>([])
const archetypeMode = ref<FilterMode>(defaultFilterMode)

const { data: commanderResults } = await useFetch('/api/commanders/search', {
  query: computed(() => ({ q: commanderSearchQuery.value })),
  watch: [commanderSearchQuery],
  default: () => []
})

const commanderOptions = computed(() => {
  return (commanderResults.value || []).map(c => ({
    label: c.name,
    value: c.id
  }))
})

const { data: bracketsData } = await useFetch('/api/brackets')
const { data: archetypesData } = await useFetch('/api/archetypes')

const bracketOptions = computed(() => {
  return (bracketsData.value || []).map(b => ({
    label: b.name,
    value: b.id
  }))
})

const archetypeOptions = computed(() => {
  return (archetypesData.value || []).map(a => ({
    label: a.name,
    value: a.id
  }))
})

const colorOptions = [
  { label: 'White', value: 'W' },
  { label: 'Blue', value: 'U' },
  { label: 'Black', value: 'B' },
  { label: 'Red', value: 'R' },
  { label: 'Green', value: 'G' },
  { label: 'Colorless', value: 'C' }
]

const hasActiveFilters = computed(() => {
  return selectedCommanderId.value
    || selectedColors.value.length > 0
    || selectedBracketId.value
    || selectedArchetypeIds.value.length > 0
})

const filterQuery = computed(() => ({
  commanderId: selectedCommanderId.value || undefined,
  colors: selectedColors.value.length > 0 ? selectedColors.value.join(',') : undefined,
  colorMode: selectedColors.value.length > 0 ? colorMode.value : undefined,
  bracketId: selectedBracketId.value || undefined,
  archetypeIds: selectedArchetypeIds.value.length > 0 ? selectedArchetypeIds.value.join(',') : undefined,
  archetypeMode: selectedArchetypeIds.value.length > 0 ? archetypeMode.value : undefined
}))

watch(filterQuery, (val) => {
  emit('update:modelValue', val)
}, { immediate: true, deep: true })

function clearFilters() {
  selectedCommanderId.value = undefined
  selectedCommanderName.value = ''
  commanderSearchQuery.value = ''
  selectedColors.value = []
  colorMode.value = defaultFilterMode
  selectedBracketId.value = undefined
  selectedArchetypeIds.value = []
  archetypeMode.value = defaultFilterMode
}

function onCommanderSelect(value: number) {
  selectedCommanderId.value = value
  const match = commanderResults.value?.find(c => c.id === value)
  if (match) selectedCommanderName.value = match.name
}

function clearCommander() {
  selectedCommanderId.value = undefined
  selectedCommanderName.value = ''
  commanderSearchQuery.value = ''
}

function clearBracket() {
  selectedBracketId.value = undefined
}
</script>

<template>
  <div class="space-y-4 pb-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Commander filter -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Commander</label>
        <div
          v-if="selectedCommanderId"
          class="flex items-center gap-2"
        >
          <UBadge
            :label="selectedCommanderName"
            color="primary"
            variant="subtle"
            size="lg"
          />
          <UButton
            icon="i-lucide-x"
            size="xs"
            variant="ghost"
            color="neutral"
            @click="clearCommander"
          />
        </div>
        <UInputMenu
          v-else
          v-model:search-term="commanderSearchQuery"
          :items="commanderOptions"
          placeholder="Search commanders..."
          value-key="value"
          class="w-full"
          @update:model-value="onCommanderSelect"
        />
      </div>

      <!-- Color filter -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Colors</label>
        <USelectMenu
          v-model="selectedColors"
          :items="colorOptions"
          value-key="value"
          multiple
          placeholder="Any color"
          class="w-full"
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
        <FilterModeToggle
          v-if="selectedColors.length > 0"
          v-model="colorMode"
        />
      </div>

      <!-- Bracket filter -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Bracket</label>
        <div class="flex items-center gap-2">
          <USelectMenu
            v-model="selectedBracketId"
            :items="bracketOptions"
            value-key="value"
            placeholder="Any bracket"
            class="w-full"
          />
          <UButton
            v-if="selectedBracketId"
            icon="i-lucide-x"
            size="xs"
            variant="ghost"
            color="neutral"
            @click="clearBracket"
          />
        </div>
      </div>

      <!-- Archetype filter -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Archetypes</label>
        <USelectMenu
          v-model="selectedArchetypeIds"
          :items="archetypeOptions"
          value-key="value"
          multiple
          placeholder="Any archetype"
          class="w-full"
        />
        <FilterModeToggle
          v-if="selectedArchetypeIds.length > 0"
          v-model="archetypeMode"
        />
      </div>
    </div>

    <div
      v-if="hasActiveFilters"
      class="flex items-center gap-2"
    >
      <UButton
        label="Clear all filters"
        icon="i-lucide-x"
        variant="ghost"
        color="neutral"
        size="sm"
        @click="clearFilters"
      />
      <span class="text-sm text-muted">
        {{ props.total ?? 0 }} deck{{ (props.total ?? 0) !== 1 ? 's' : '' }} found
      </span>
    </div>
  </div>
</template>
