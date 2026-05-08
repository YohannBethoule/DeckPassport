<template>
  <UContainer class="flex flex-col items-center justify-center gap-6 py-24 text-center max-w-md">
    <UIcon
      name="i-lucide-lock"
      class="size-12 text-muted"
    />
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold">
        Sign in required
      </h1>
      <p class="text-muted">
        You need to be signed in to access this page.
      </p>
    </div>
    <div class="flex gap-3">
      <UButton
        to="/login"
        icon="i-lucide-user"
      >
        Sign in
      </UButton>
      <UButton
        to="/"
        variant="outline"
        color="neutral"
      >
        Back to home
      </UButton>
    </div>
  </UContainer>
</template>
