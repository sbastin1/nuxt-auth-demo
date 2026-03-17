<template>
  <h1 class="flex justify-center mt-20 font-bold text-4xl">
    {{ data?.sensitive }}
  </h1>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { data } = await useFetch("/api/admin", {
  lazy: true,
});
</script>
