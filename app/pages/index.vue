<script setup lang="ts">
import DeckPassportLogo from '~/assets/images/mtgdeckpassport.png'
</script>

<template>
  <div>
    <UPageHero
      title="Create your EDH deck passport"
      description="Give your favorite commander decks a nice business card to introduce them."
      :links="[{
        label: 'Create New Deck',
        to: '/new-deck',
        trailingIcon: 'i-lucide-arrow-right',
        size: 'xl'
      }]"
      :ui="{
        container: 'gap-2 sm:gap-3 py-12 sm:py-12 lg:py-12'
      }"
      reverse
    >
      <img
        :src="DeckPassportLogo"
        alt="logo"
        class="h-72 aspect-square mx-auto"
      >
    </UPageHero>
  </div>
</template>
