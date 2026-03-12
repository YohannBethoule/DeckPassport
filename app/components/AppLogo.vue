<script setup lang="ts">
import DeckPassportLogo from '~/assets/images/mtgdeckpassport.png'
</script>

<template>
  <div class="flex flex-row gap-2 items-center justify-center text-base sm:text-2xl font-serif">
    <img
      :src="DeckPassportLogo"
      alt="logo"
      class="h-6 sm:h-12"
    >
    <span class="whitespace-nowrap">EDH DeckPassport</span>
  </div>
</template>
