<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'

const route = useRoute()
const deckId = Number(route.params.id)

const { data: rawDeck } = await useFetch(`/api/deck/${deckId}`)

if (!rawDeck.value) {
  throw createError({ statusCode: 404, statusMessage: 'Deck not found' })
}

const { useSession } = useAuth()
const session = useSession()

const isOwner = computed(() =>
  !!session.value?.data?.user?.id && rawDeck.value?.userId === session.value.data.user.id
)

const deckView = computed(() => rawDeck.value ? toDeckView(rawDeck.value) : null)
const deck = computed(() => deckView.value?.deck ?? null)
const archetypeNames = computed(() => deckView.value?.archetypeNames ?? [])

const exportComponent = ref<{ $el: HTMLElement } | null>(null)
const exportRef = computed(() => exportComponent.value?.$el ?? null)
const { download, loading } = useDownloadCard(exportRef)

const deleteModalOpen = ref(false)
const deleting = ref(false)

async function deleteDeck() {
  deleting.value = true
  try {
    await $fetch(`/api/deck/${deckId}`, { method: 'DELETE' })
    navigateTo('/')
  } finally {
    deleting.value = false
    deleteModalOpen.value = false
  }
}

function editOrDuplicate() {
  if (isOwner.value) {
    navigateTo(`/deck/${deckId}/edit`)
    return
  }

  const deckData = deckView.value?.deck
  if (!deckData) return

  const prefill = useState<InsertDeckWithCommander>('deckPrefill')
  prefill.value = { ...deckData }
  navigateTo('/deck/new')
}
</script>

<template>
  <UPage v-if="deck">
    <UPageBody>
      <DeckView
        :deck="deck"
        :archetype-names="archetypeNames"
      />

      <div
        v-if="rawDeck?.user"
        class="flex items-center justify-center gap-2 mt-4 text-sm text-muted"
      >
        <span>Created by</span>
        <NuxtLink
          :to="`/profile/${rawDeck.user.id}`"
          class="flex items-center gap-1.5 text-default hover:underline"
        >
          <UAvatar
            :src="rawDeck.user.image ?? undefined"
            :alt="rawDeck.user.name"
            size="2xs"
          />
          {{ rawDeck.user.name }}
        </NuxtLink>
      </div>

      <div class="flex justify-center gap-2 mt-4">
        <UButton
          label="Download as Image"
          icon="i-lucide-download"
          :loading="loading"
          @click="download()"
        />
        <UButton
          :label="isOwner ? 'Edit Deck' : 'Duplicate & Edit'"
          :icon="isOwner ? 'i-lucide-pencil' : 'i-lucide-copy'"
          variant="outline"
          @click="editOrDuplicate"
        />
        <UButton
          v-if="isOwner"
          label="Delete"
          icon="i-lucide-trash-2"
          color="error"
          variant="outline"
          @click="deleteModalOpen = true"
        />
      </div>

      <UModal v-model:open="deleteModalOpen">
        <template #content>
          <div class="p-6 space-y-4">
            <h3 class="text-lg font-semibold">
              Delete Deck
            </h3>
            <p>Are you sure you want to delete <strong>{{ deck.title }}</strong>? This action cannot be undone.</p>
            <div class="flex justify-end gap-2">
              <UButton
                label="Cancel"
                variant="outline"
                @click="deleteModalOpen = false"
              />
              <UButton
                label="Delete"
                color="error"
                :loading="deleting"
                @click="deleteDeck"
              />
            </div>
          </div>
        </template>
      </UModal>
    </UPageBody>
    <div class="fixed -left-2499.75 top-0">
      <DeckViewExport
        ref="exportComponent"
        :deck="deck"
        :archetype-names="archetypeNames"
      />
    </div>
  </UPage>
</template>
