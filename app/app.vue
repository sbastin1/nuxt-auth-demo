<template>
  <UApp>
    <UHeader title="Auth Form" to="/">
      <template #right>
        <AuthControls />
      </template>

      <UNavigationMenu :items="items" />

      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <UFooter />
  </UApp>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const { loggedIn } = useUserSession();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Overview",
    to: "/overview",
    icon: "i-material-symbols-overview-key-outline-rounded",
    active: route.path.startsWith("/overview"),
  },
  {
    label: "Protected Page",
    to: "/admin",
    icon: "i-material-symbols-admin-panel-settings-outline",
    active: route.path.startsWith("/admin"),
  },
  ...(loggedIn.value
    ? [
        {
          label: "Settings",
          to: "/settings",
          icon: "i-lucide-settings",
          active: route.path.startsWith("/settings"),
        },
      ]
    : []),
  {
    label: "Github",
    icon: "i-lucide-github",
    to: "https://github.com/sbastin1",
    target: "_blank",
  },
]);
</script>

<style>
:root {
  --ui-container: 90rem;
}
</style>
