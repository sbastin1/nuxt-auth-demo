<template>
  <div class="w-full">
    <dl v-if="user" class="grid grid-cols-12 gap-y-4 pt-4">
      <dt class="col-span-3 font-medium text-gray-400">ID</dt>
      <dd class="col-span-9">{{ user.id }}</dd>

      <dt class="col-span-3 font-medium text-gray-400">Name</dt>
      <dd class="col-span-9">{{ user.name }}</dd>

      <dt class="col-span-3 font-medium text-gray-400">Email</dt>
      <dd class="col-span-9 break-all">{{ user.email }}</dd>

      <dt class="col-span-3 font-medium text-gray-400">Login</dt>
      <dd class="col-span-9">{{ user.loginname }}</dd>

      <dt class="col-span-3 font-medium text-gray-400">Provider</dt>
      <dd class="col-span-9">{{ user.provider.join(", ") }}</dd>

      <dt class="col-span-3 font-medium text-gray-400">Two Factor</dt>
      <dd class="col-span-9">
        {{ user.twoFactorEnabled ? "Enabled" : "Disabled" }}
      </dd>
      <dt class="col-span-3 font-medium text-gray-400">
        Two Factor Session Data
      </dt>
      <dd class="col-span-9">
        {{ session?.twoFactor?.required ? "Enabled" : "Disabled" }}
      </dd>
    </dl>

    <div v-else class="w-full rounded-lg bg-error p-4 text-black">
      <div class="font-semibold">User not found</div>
      <p class="text-sm mt-1">
        The requested user could not be loaded or does not exist.
      </p>
    </div>
  </div>

  <p>{{ user?.provider }}</p>
  <p>{{ session }}</p>
</template>

<script setup lang="ts">
const { user, session, fetch } = useUserSession();
fetch();
</script>
