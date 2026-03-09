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
    <div v-if="loggedIn && user?.provider.includes('credentials')">
      <UButton
        @click="user?.twoFactorEnabled ? openDisableModal() : openSetupModal()"
        >{{ toggle2FA }}</UButton
      >
    </div>
    <div
      v-if="loggedIn && !user?.provider.includes('passkey') && passkeySupported"
    >
      <UButton @click="handleAddPasskey">Enable Passkey</UButton>
    </div>
  </AuthState>

  <TwoFactorSetupModal
    v-if="isOpenSetupModal"
    :qrcode="qrcode"
    v-model="modelValue"
    @close="closeModals"
    @submit="setup2FA"
  />

  <TwoFactorDisableModal
    v-if="isOpenDisableModal"
    v-model="modelValue"
    @close="closeModals"
    @submit="disable2FA"
  />
</template>

<script setup lang="ts">
import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { FetchError } from "ofetch";
import { registerPasskey } from "~/composables/registerPasskey";

const { loggedIn, user, clear, fetch } = useUserSession();
const toast = useToast();
const passkeySupported = browserSupportsWebAuthn();
const qrcode = ref("");
const modelValue = ref<number[]>();
const isOpenSetupModal = ref(false);
const isOpenDisableModal = ref(false);

const toggle2FA = computed(() => {
  return user.value?.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA";
});

const handleLogout = () => {
  clear();
  navigateTo("/login");
};

const openSetupModal = async () => {
  modelValue.value = [];

  const qr = await $fetch("/auth/2fa/setup", {
    method: "GET",
  });
  qrcode.value = qr;
  isOpenSetupModal.value = true;
};

const setup2FA = async () => {
  const token = modelValue.value?.toString().split(",").join("");

  try {
    await $fetch("/auth/2fa/activate", {
      method: "POST",
      body: {
        token: token,
      },
    });

    toast.add({
      title: "Successfully activated 2FA!",
      description: "Congrats!",
    });

    fetch();
  } catch (e) {
    if (e instanceof FetchError) {
      toast.add({
        title: "Error Activating 2FA",
        description: e.data.message,
        color: "error",
      });
    } else {
      toast.add({
        title: "Error Activating 2FA",
        description:
          "There was an issue activating 2FA. Please contact support.",
        color: "error",
      });
    }
  }

  closeModals();
};

fetch();

const openDisableModal = () => {
  modelValue.value = [];
  isOpenDisableModal.value = true;
};

const disable2FA = async () => {
  const token = modelValue.value?.toString().split(",").join("");

  try {
    await $fetch("/auth/2fa/disable", {
      method: "POST",
      body: {
        token: token,
      },
    });

    toast.add({
      title: "Successfully disabled 2FA!",
      description: "Why? ..",
    });

    fetch();
  } catch (e) {
    if (e instanceof FetchError) {
      toast.add({
        title: "Error Deactivating 2FA",
        description: e.data.message,
        color: "error",
      });
    } else {
      toast.add({
        title: "Error Deactivating 2FA",
        description:
          "There was an issue deactivating 2FA. Please contact support.",
        color: "error",
      });
    }
  }
};

const closeModals = () => {
  isOpenSetupModal.value = false;
  isOpenDisableModal.value = false;
};

const handleAddPasskey = async () => {
  try {
    await registerPasskey();
    fetch();
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      // user cancelled the passkey prompt
      return;
    }
  }
};
</script>
