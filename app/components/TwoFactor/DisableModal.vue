<template>
  <Teleport to="body">
    <UCard
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 shadow-2xl"
    >
      <UForm class="flex flex-col items-center p-6 rounded-lg">
        <p class="my-4 text-lg font-medium">Please enter your 2FA OTP</p>
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
const model = defineModel<number[]>();

const emit = defineEmits(["close", "submit"]);
</script>
