<script setup lang="ts">
definePageMeta({
  layout: false
})

const { signIn, signUp } = useAuth()

const isRegister = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    if (isRegister.value) {
      if (password.value !== passwordConfirm.value) {
        error.value = 'Passwords do not match'
        return
      }
      const { error: signUpError } = await signUp.email({
        name: name.value,
        email: email.value,
        password: password.value
      })
      if (signUpError) {
        error.value = signUpError.message ?? 'Registration failed'
        return
      }
    } else {
      const { error: signInError } = await signIn.email({
        email: email.value,
        password: password.value
      })
      if (signInError) {
        error.value = signInError.message ?? 'Login failed'
        return
      }
    }
    navigateTo('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
  } finally {
    loading.value = false
  }
}

async function handleGoogleSignIn() {
  await signIn.social({
    provider: 'google',
    callbackURL: '/'
  })
}
</script>

<template>
  <UApp>
    <UMain>
      <UContainer class="max-w-md py-16">
        <UCard>
          <template #header>
            <div class="text-center">
              <h1 class="text-2xl font-bold">
                {{ isRegister ? 'Create an account' : 'Sign in' }}
              </h1>
              <p class="text-sm text-muted mt-1">
                {{ isRegister ? 'Sign up to link decks to your account' : 'Welcome back to DeckPassport' }}
              </p>
            </div>
          </template>

          <form
            class="flex flex-col gap-4"
            @submit.prevent="handleSubmit"
          >
            <UFormField
              v-if="isRegister"
              label="Name"
              class="w-full"
            >
              <UInput
                v-model="name"
                placeholder="Your name"
                class="w-full"
                required
              />
            </UFormField>

            <UFormField
              label="Email"
              class="w-full"
            >
              <UInput
                v-model="email"
                type="email"
                placeholder="you@example.com"
                class="w-full"
                required
              />
            </UFormField>

            <UFormField
              label="Password"
              class="w-full"
            >
              <UInput
                v-model="password"
                type="password"
                placeholder="Your password"
                class="w-full"
                required
              />
            </UFormField>

            <UFormField
              v-if="isRegister"
              label="Confirm password"
              class="w-full"
            >
              <UInput
                v-model="passwordConfirm"
                type="password"
                placeholder="Confirm your password"
                class="w-full"
                required
              />
            </UFormField>

            <p
              v-if="error"
              class="text-sm text-red-500"
            >
              {{ error }}
            </p>

            <UButton
              type="submit"
              block
              :loading="loading"
            >
              {{ isRegister ? 'Sign up' : 'Sign in' }}
            </UButton>
            <p
              v-if="!isRegister"
              class="text-sm text-muted"
            >
              Forgot your password? <a
                href="mailto:yohann.bethoule@gmail.com"
                class="underline text-default"
              >Email me</a> and we'll sort it out.
            </p>
          </form>

          <USeparator
            label="or"
            class="my-4"
          />

          <UButton
            block
            color="neutral"
            variant="outline"
            icon="i-simple-icons-google"
            @click="handleGoogleSignIn"
          >
            Continue with Google
          </UButton>

          <template #footer>
            <div class="flex flex-col gap-2 text-sm text-center text-muted">
              <p>
                {{ isRegister ? 'Already have an account?' : "Don't have an account?" }}
                <button
                  class="underline text-default"
                  @click="isRegister = !isRegister"
                >
                  {{ isRegister ? 'Sign in' : 'Sign up' }}
                </button>
              </p>
            </div>
          </template>
        </UCard>

        <div class="text-center mt-4">
          <NuxtLink
            to="/"
            class="text-sm text-muted underline"
          >
            Back to home
          </NuxtLink>
        </div>
      </UContainer>
    </UMain>
  </UApp>
</template>
