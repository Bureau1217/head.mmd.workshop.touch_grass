<template>
  <header class="v-app-header-home app-with-gutter">
    <div class="v-app-header-home__container app-container app-container--flex-wrap--nowrap app-container--justify-content--space-between app-container--align-items--center">
      <NuxtLink to="/" style="color: var(--app-color-tertiary)">touch_grass — workshop · HEAD – Genève</NuxtLink>
      <div style="color: var(--app-color-quaternary)" >bureau 1217 × HEAD – Genève · master media design</div>
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

a {
  text-decoration: none;
  color: inherit;
}
</style>
