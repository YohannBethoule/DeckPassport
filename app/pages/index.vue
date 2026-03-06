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
    <UPageSection
      title="Share it with others"
      icon="i-lucide-share-2"
      orientation="horizontal"
    >
      <img
        src="~/assets/images/gitrogexample.png"
        alt="example card"
      >
    </UPageSection>
    <UPageSection
      title="What's next ?"
      headline="Coming soon"
    >
      <DevLogList
        :items="[
          { title: 'Partner Commanders', description: 'Allow to create deck passport with two commanders', icon: 'i-lucide-users' },
          { title: 'User Account', description: 'Create your account and save your decks', icon: 'i-lucide-shield-user' },
          { title: 'Alternative Prints', description: 'Choose the card printing you want for your commander', icon: 'i-lucide-sparkles' }
        ]"
      />
    </UPageSection>
  </div>
</template>
