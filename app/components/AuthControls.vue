<template>
  <AuthState v-slot="{ loggedIn, clear }">
    <div v-if="loggedIn" class="flex items-center gap-4">
      {{ user?.name }}
      <UButton @click="handleLogout">Logout</UButton>
    </div>
    <div v-else>
      <UButton as-child>
        <NuxtLink to="/login">Login</NuxtLink>
      </UButton>
    </div>
  </AuthState>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession();

const handleLogout = () => {
  clear();
  navigateTo("/login");
};
</script>
