<template>
  <div class="p-6 space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold">Passkeys</h2>

      <UButton
        icon="i-lucide-key-round"
        color="primary"
        variant="solid"
        :loading="isRegistering"
        :disabled="isRegistering"
        @click="handleAddPasskey"
      >
        Add Passkey
      </UButton>
    </div>

    <div class="rounded-xl border border-default overflow-hidden">
      <UTable :data="passkeys" :columns="columns">
        <template #credentialId-cell="{ row }">
          <span class="font-mono text-xs">
            {{ row.original.credentialId.slice(0, 16) }}...
          </span>
        </template>

        <template #deviceType-cell="{ row }">
          <UBadge variant="subtle">
            {{ row.original.deviceType }}
          </UBadge>
        </template>

        <template #transports-cell="{ row }">
          <div class="flex gap-1">
            <UBadge
              v-for="t in row.original.transports"
              :key="t"
              variant="soft"
            >
              {{ t }}
            </UBadge>
          </div>
        </template>

        <template #backedUp-cell="{ row }">
          <UBadge
            :color="row.original.backedUp ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ row.original.backedUp ? "Yes" : "No" }}
          </UBadge>
        </template>

        <template #createdAt-cell="{ row }">
          {{ new Date(row.original.createdAt).toLocaleString() }}
        </template>

        <template #actions-cell="{ row }">
          <UButton
            size="xs"
            color="error"
            variant="soft"
            icon="i-lucide-trash"
            @click="handleRemovePasskey(row.original.id)"
          >
            Remove
          </UButton>
        </template>
      </UTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

type Passkey = {
  id: number;
  credentialId: string;
  counter: number;
  deviceType: string;
  backedUp: boolean;
  transports: string[];
  createdAt: string;
};

const isRegistering = ref(false);

const { data, refresh } = await useFetch<{ passkeys: Passkey[] }>(
  "/api/auth/passkey/getuser",
);

const passkeys = computed(() => data.value?.passkeys ?? []);

async function handleAddPasskey() {
  if (isRegistering.value) return;

  try {
    isRegistering.value = true;

    await registerPasskey();

    await refresh();
  } catch (err) {
    console.error("Failed to register passkey", err);
  } finally {
    isRegistering.value = false;
  }
}

async function handleRemovePasskey(id: number) {
  try {
    await removePasskey(id);
    await refresh();
  } catch (err) {
    console.error("Failed to delete passkey", err);
  }
}

const columns: TableColumn<Passkey>[] = [
  {
    id: "credentialId",
    accessorKey: "credentialId",
    header: "Credential ID",
  },
  {
    id: "deviceType",
    accessorKey: "deviceType",
    header: "Device Type",
  },
  {
    id: "counter",
    accessorKey: "counter",
    header: "Counter",
  },
  {
    id: "transports",
    accessorKey: "transports",
    header: "Transports",
  },
  {
    id: "backedUp",
    accessorKey: "backedUp",
    header: "Backed Up",
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    id: "actions",
    header: "",
  },
];
</script>
