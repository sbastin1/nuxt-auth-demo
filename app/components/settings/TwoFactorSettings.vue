<template>
  <AuthState>
    <div
      v-if="loggedIn && user?.provider.includes('credentials')"
      class="flex items-center justify-between gap-4"
    >
      <div>
        <p class="font-medium">Two-Factor Authentication</p>

        <p class="text-sm text-gray-500">
          <span v-if="user?.twoFactorEnabled">
            2FA is currently enabled for your account.
          </span>

          <span v-else>
            Protect your account by enabling 2FA using an authenticator app.
          </span>
        </p>
      </div>

      <UBadge
        :color="user?.twoFactorEnabled ? 'success' : 'neutral'"
        variant="subtle"
      >
        {{ user?.twoFactorEnabled ? "Enabled" : "Disabled" }}
      </UBadge>

      <UButton
        :color="user?.twoFactorEnabled ? 'error' : 'primary'"
        class="wrap-anywhere"
        @click="user?.twoFactorEnabled ? openDisableModal() : openSetupModal()"
      >
        {{ toggle2FA }}
      </UButton>
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
import { FetchError } from "ofetch";

const toast = useToast();
const { user, loggedIn, fetch, session } = useUserSession();

const qrcode = ref("");
const modelValue = ref<number[]>([]);

const isOpenSetupModal = ref(false);
const isOpenDisableModal = ref(false);

const toggle2FA = computed(() =>
  user.value?.twoFactorEnabled
    ? "Disable Two-Factor Authentication"
    : "Enable Two-Factor Authentication",
);

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
      body: { token },
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

const openDisableModal = () => {
  modelValue.value = [];
  isOpenDisableModal.value = true;
};

const disable2FA = async () => {
  const token = modelValue.value?.toString().split(",").join("");

  try {
    await $fetch("/auth/2fa/disable", {
      method: "POST",
      body: { token },
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
</script>
