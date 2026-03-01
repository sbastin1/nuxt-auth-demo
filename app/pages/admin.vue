<template>{{ data?.sensitive }}</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { data } = await useFetch("/api/admin", {
  lazy: true,
});
</script>
