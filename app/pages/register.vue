<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import { FetchError } from "ofetch";

const { loggedIn, fetch, openInPopup } = useUserSession();
const toast = useToast();

const fields: AuthFormField[] = [
  {
    name: "name",
    type: "text",
    label: "Name",
    placeholder: "Enter your name",
    required: true,
  },
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
];

const providers = [
  {
    label: "GitHub",
    icon: "i-simple-icons-github",
    onClick: () => {
      toast.add({ title: "GitHub", description: "Login with GitHub" });
      openInPopup("/auth/github");
    },
  },
];

const schema = z.object({
  name: z
    .string("Name is required")
    .max(16, "Can not be longer than 16 Characters"),
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
  if (loggedIn.value) {
    toast.add({
      title: "Already Logged In",
      description: "Please log out to create a new account",
      color: "error",
    });

    return;
  }

  try {
    await $fetch("/auth/register", {
      method: "POST",
      body: payload.data,
    });

    fetch();

    toast.add({
      title: "Success!",
      description: "You have successfully registered!",
    });
  } catch (e) {
    if (e instanceof FetchError) {
      toast.add({
        title: "Error Registering",
        description: e.data.message,
        color: "error",
      });
    } else {
      toast.add({
        title: "Error Registering",
        description: "There was an issue registering. Please contact support.",
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
        title="Sign Up"
        description="Enter your credentials to register your account."
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        @submit="onSubmit"
      >
      </UAuthForm>
    </UPageCard>
  </div>
</template>
