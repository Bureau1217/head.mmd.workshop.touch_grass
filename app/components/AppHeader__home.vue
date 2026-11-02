<template>
  <header class="v-app-header-home app-with-gutter">
    <div class="v-app-header-home__container app-container app-container--flex-wrap--nowrap app-container--justify-content--space-between app-container--align-items--center">
      <NuxtLink to="/" class="v-app-header-home__home">
        <span>Bureau 1217</span>
        <span class="v-app-header-home__home--desktop"> / HEAD – Media Design Master</span>
        <span class="v-app-header-home__home--mobile">HEAD Master Media Design</span>
      </NuxtLink>
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

.v-app-header-home__home--mobile {
  display: none;
}

.v-app-header-home__nav {
  display: flex;
  gap: var(--app-gutter-half);
  color: var(--app-color-tertiary);
}

@media (max-width: 700px) {
  .v-app-header-home__home span {
    display: block;
  }

  .v-app-header-home__home .v-app-header-home__home--desktop {
    display: none;
  }

  .v-app-header-home__nav {
    flex-direction: column;
    align-items: flex-end;
    gap: .2rem;
  }
}

@media (max-width: 359px) {
  .v-app-header-home__home {
    font-size: .75rem;
  }
}
</style>
