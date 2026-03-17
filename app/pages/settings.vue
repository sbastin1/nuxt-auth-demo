<template>
  <div class="lg:hidden">
    <USelect
      v-model="selected"
      :items="items"
      variant="ghost"
      class="w-full rounded-none"
      color="primary"
      highlight
      size="xl"
      :ui="{
        content: 'max-w-[calc(100vw-1rem)]',
        value: 'text-red-400',
      }"
    />
  </div>
  <UContainer>
    <UPage
      :ui="{
        left: 'lg:col-span-2',
        center: 'lg:col-span-8',
      }"
    >
      <template #left>
        <UPageAside>
          <UTabs
            v-model="selected"
            :items="items"
            orientation="vertical"
            variant="link"
            :ui="{
              list: 'w-full bg-transparent',
            }"
          />
        </UPageAside>
      </template>

      <UPageBody>
        <component :is="currentComponent" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script lang="ts" setup>
import ProfileSettings from "~/components/settings/ProfileSettings.vue";
import TwoFactorSettings from "~/components/settings/TwoFactorSettings.vue";
import PasskeySettings from "~/components/settings/PasskeySettings.vue";
import DebugSettings from "~/components/settings/DebugSettings.vue";
import type { Component } from "vue";

const { user } = useUserSession();
const selected = ref<SettingsTab>("profile");

const items = computed(() => {
  const isOAuth = user.value?.provider?.includes("oauth");

  return [
    { label: "Profile", value: "profile", icon: "i-lucide-user" },

    ...(!isOAuth
      ? [
          { label: "Passkeys", value: "passkeys", icon: "i-lucide-key" },
          {
            label: "2F Authentication",
            value: "totp",
            icon: "i-lucide-shield",
          },
        ]
      : []),
  ];
});

const componentMap = {
  profile: ProfileSettings,
  totp: TwoFactorSettings,
  passkeys: PasskeySettings,
  debug: DebugSettings,
} satisfies Record<string, Component>;

type SettingsTab = keyof typeof componentMap;

const currentComponent = computed(() => componentMap[selected.value]);
</script>
