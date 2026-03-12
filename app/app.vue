<script setup>
const { useSession, signOut } = useAuth()
const session = useSession()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'EDH DeckPassport'
const description = 'DeckPassport is a tool for MTG Commander players to generate a sleek, shareable card that captures the identity of their deck — commander art, color identity, bracket, win conditions, and key cards, all in one image. No more walls of text to explain your deck. Just share the card.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://deck-passport.vercel.app/homepage_screenshot.png',
  twitterImage: 'https://deck-passport.vercel.app/homepage_screenshot.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <template #right>
        <UNavigationMenu
          :items="[
            { label: 'Create Deck', to: '/deck/new', icon: 'i-lucide-plus' },
            ...(session?.data?.user ? [{ label: 'My Decks', to: '/my-decks', icon: 'i-lucide-layout-grid' }] : [])
          ]"
          class="hidden sm:flex"
        />
        <template v-if="session?.data?.user">
          <UDropdownMenu
            :items="[
              [{
                label: 'Sign out',
                icon: 'i-lucide-log-out',
                onSelect: () => signOut().then(() => navigateTo('/'))
              }]
            ]"
          >
            <UButton
              color="neutral"
              variant="ghost"
            >
              <UAvatar
                :src="session.data.user.image ?? undefined"
                :alt="session.data.user.name"
                size="xs"
              />
              <span class="hidden sm:inline">{{ session.data.user.name }}</span>
            </UButton>
          </UDropdownMenu>
        </template>
        <UButton
          v-else
          to="/login"
          variant="outline"
          color="neutral"
          size="sm"
        >
          Sign in
        </UButton>
        <UColorModeButton />
      </template>

      <template #panel>
        <UNavigationMenu
          :items="[
            { label: 'Create Deck', to: '/deck/new', icon: 'i-lucide-plus' },
            ...(session?.data?.user ? [{ label: 'My Decks', to: '/my-decks', icon: 'i-lucide-layout-grid' }] : [])
          ]"
          orientation="vertical"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built by <a
            target="_blank"
            href="https://www.yohannbethoule.com"
            class="underline text-default"
          >Yohann Bethoule</a> • ©&nbsp;{{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/YohannBethoule/DeckPassport"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
