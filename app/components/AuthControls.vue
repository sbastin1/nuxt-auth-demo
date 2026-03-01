<template>
  <div v-if="loggedIn" class="flex items-center gap-4">
    {{ user?.loginname }}
    <UButton
      @click="
        clear();
        navigateTo('/login');
      "
      >Logout</UButton
    >
  </div>
  <div v-else>
    <UButton as-child>
      <NuxtLink to="/login">Login</NuxtLink>
    </UButton>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession();
</script>
