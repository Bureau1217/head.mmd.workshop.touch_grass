<template>
  <header class="v-app-header-home app-with-gutter">
    <div class="v-app-header-home__container app-container app-container--flex-wrap--nowrap app-container--justify-content--space-between app-container--align-items--center">
      <NuxtLink to="/" class="v-app-header-home__home">Bureau 1217 / HEAD – Media Design Master</NuxtLink>
      <nav class="v-app-header-home__nav">
        <AppButton to="/intro">WORKSHOP</AppButton>
        <AppButton to="/projects">PROJECTS</AppButton>
      </nav>
    </div>
  </header>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
.v-app-header-home {
  background: var(--app-color-white);
  user-select: none;
}

.v-app-header-home__container {
  height: var(--app-header-height);
}

.v-app-header-home__home {
  text-decoration: none;
  color: var(--app-color-tertiary);
}

.v-app-header-home__nav {
  display: flex;
  gap: var(--app-gutter-half);
  color: var(--app-color-tertiary);
}
</style>
