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

if (!isOwner.value) {
  throw createError({ statusCode: 403, statusMessage: 'You can only edit your own decks' })
}

const deckView = computed(() => rawDeck.value ? toDeckView(rawDeck.value) : null)
const initialValues = computed(() => deckView.value?.deck ?? undefined)

async function onSubmit(data: InsertDeckWithCommander) {
  await $fetch(`/api/deck/${deckId}`, {
    method: 'PUT',
    body: data
  })
  navigateTo(`/deck/${deckId}`)
}
</script>

<template>
  <UPage v-if="initialValues">
    <UPageHeader
      headline="Edit Deck"
      title="Edit your Deck Passport"
      description="Update the details of your commander deck passport."
      :ui="{ root: 'px-6 sm:px-12' }"
    />

    <UPageBody class="p-4">
      <DeckForm
        :initial-values="initialValues"
        submit-label="Save Changes"
        @submit="onSubmit"
      />
    </UPageBody>
  </UPage>
</template>
