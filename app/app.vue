<template>
  <UApp>
    <UHeader title="Auth Form" to="/">
      <template #right>
        <AuthControls />
      </template>
    </UHeader>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <UFooter />
  </UApp>
</template>
