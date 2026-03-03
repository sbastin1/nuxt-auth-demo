<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import { FetchError } from "ofetch";

const { loggedIn, fetch, openInPopup } = useUserSession();
const toast = useToast();

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

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    await $fetch("auth/login", {
      method: "POST",
      body: payload.data,
    });

    toast.add({
      title: "Logged In Successfully!",
      description: "Welcome!",
    });

    fetch();
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
</script>

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
</template>
