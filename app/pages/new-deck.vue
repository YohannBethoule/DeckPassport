<template>
  <UPage>
    <UPageHeader
      headline="New Deck"
      title="Create your Deck Passport"
      description="Fill in the details about your commander deck to generate a business card."
      :ui="{ root: 'px-12' }"
    />

    <UPageBody>
      <DeckForm />
    </UPageBody>
  </UPage>
</template>
