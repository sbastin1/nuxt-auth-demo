<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 mt-10">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        @submit="onSubmit"
      >
        <template #description>
          Don't have an account?
          <ULink to="/register" class="text-primary font-medium">Sign up</ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>

  <TwoFactorVerifyModal
    v-if="isOpenModal"
    v-model="modelValue"
    @close="closeModal"
    @submit="verifyTwoFactor"
  />
</template>

<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import { FetchError } from "ofetch";

const { loggedIn, fetch, openInPopup, session } = useUserSession();
const toast = useToast();
const modelValue = ref<number[]>();
const isOpenModal = ref(false);

const twoFactorEnabled = computed(() => session.value?.twoFactor?.required);

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Enter your email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
  {
    name: "remember",
    label: "Remember me",
    type: "checkbox",
  },
];

const providers = [
  {
    label: "Use Passkey",
    icon: "i-simple-icons-passbolt",
    onClick: () => {
      handlePasskeyLogin();
    },
  },
  {
    label: "GitHub",
    icon: "i-simple-icons-github",
    onClick: () => {
      openInPopup("/auth/github");
    },
  },
];

const schema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string("Password is required")
    .min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

watch(loggedIn, () => {
  if (loggedIn.value) navigateTo("/admin");
});

const closeModal = () => {
  isOpenModal.value = false;
};

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    await $fetch("auth/login", {
      method: "POST",
      body: payload.data,
    });

    await fetch();

    if (twoFactorEnabled.value) {
      isOpenModal.value = true;
      return;
    }

    toast.add({
      title: "Logged In Successfully!",
      description: "Welcome!",
    });
  } catch (e) {
    if (e instanceof FetchError) {
      toast.add({
        title: "Error Logging In",
        description: e.data.message,
        color: "error",
      });
    } else {
      toast.add({
        title: "Error Logging In",
        description: "There was an issue logging in. Please contact support.",
        color: "error",
      });
    }
  }
}

const verifyTwoFactor = async () => {
  const token = modelValue.value?.toString().split(",").join("");

  try {
    await $fetch("/auth/2fa/verify", {
      method: "POST",
      body: {
        token: token,
      },
    });

    fetch();

    toast.add({
      title: "Logged In Successfully!",
      description: "Welcome!",
    });
  } catch (e) {
    if (e instanceof FetchError) {
      toast.add({
        title: "Error Logging In",
        description: e.data.message,
        color: "error",
      });
    } else {
      toast.add({
        title: "Error Logging In",
        description: "There was an issue logging in. Please contact support.",
        color: "error",
      });
    }
  }
};

const handlePasskeyLogin = async () => {
  try {
    const result = await loginWithPasskey();
    fetch();
    if (result?.verified) {
      await navigateTo("/admin");
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      // user cancelled the passkey prompt
      return;
    }
    console.error(e);
  }
};
</script>
