<template>
  <div>
    <AppHeaderHome v-if="isHome"/>
    <AppHeader v-else/>
  </div>
  <div>
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>
