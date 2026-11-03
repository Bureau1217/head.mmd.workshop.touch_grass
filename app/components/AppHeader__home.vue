<template>
  <header class="v-app-header-home app-with-gutter">
    <div class="v-app-header-home__container app-container app-container--flex-wrap--nowrap app-container--justify-content--space-between ">
      <NuxtLink to="/" class="v-app-header-home__home">
        <span class="v-app-header-home__name">TOUCH_GRASS — WORKSHOP</span>
        <span>BUREAU 1217 × HEAD – GENÈVE</span>
      </NuxtLink>
      <nav class="v-app-header-home__nav">
        <AppButton to="/intro">WORKSHOP</AppButton>
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
  gap: var(--app-gutter-half);
  // the same margin in all four corners of the screen (AppFooter)
  align-items: flex-start;
  padding-top: var(--app-gutter-half);
  box-sizing: border-box;
}

.v-app-header-home__home {
  display: flex;
  flex-direction: column;
  gap: .35em;
  min-width: 0;
  font-family: 'Geist Mono', monospace;
  font-size: .55rem;
  line-height: 1.35;
  color: #000;
  text-decoration: none;

  span {
    display: block;
    white-space: nowrap;
    // down to the letters themselves, or the line's own spacing adds to the margin
    text-box: trim-both cap alphabetic;
  }

  @media (max-width: 700px) {
    font-size: .8rem;
    line-height: 1.4;
  }

  // shrinks with the screen, so the text and the button always fit beside each other
  @media (max-width: 400px) {
    font-size: 3vw;
  }
}

.v-app-header-home__home .v-app-header-home__name {
  color: var(--app-color-primary);
}

.v-app-header-home__nav {
  display: flex;
  flex: 0 0 auto;
  gap: var(--app-gutter-half);
  color: var(--app-color-tertiary);

  @media (min-width: 701px) {
    font-size: .65rem;
  }
}
</style>
