<template>
  <Teleport to="body">
    <UCard
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 shadow-2xl"
    >
      <UForm class="flex flex-col items-center p-6 rounded-lg">
        <p class="mb-4 text-lg font-medium">1. Scan to Enable 2FA</p>

        <div class="bg-white p-2 rounded-md ring-1 ring-gray-200">
          <NuxtImg :src="qrcode" alt="QR Code" class="w-48 h-48" />
        </div>

        <p class="my-4 text-lg font-medium">2. Enter the 2FA Code</p>
        <UPinInput type="number" otp length="6" v-model="model" required />

        <UButton class="w-full justify-center mt-4" @click="emit('submit')">
          Submit
        </UButton>

        <UButton class="mt-6" @click="emit('close')"> Cancel </UButton>
      </UForm>
    </UCard>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps({
  qrcode: String,
});

const model = defineModel<number[]>();

const emit = defineEmits(["close", "submit"]);
</script>
