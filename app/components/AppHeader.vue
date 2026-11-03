<template>
  <header class="v-app-header app-with-gutter">
    <NuxtLink to="/" aria-label="TOUCH_GRASS, home" class="v-app-header__home app-container app-container--flex-wrap--nowrap app-container--align-items--flex-end">
      <div>
        <AppTextTouch
                width="auto"
                height="2rem"
        />
      </div>

      <div class="app-container__coll-12-12">
        <AppGrass
                :size="15"
        />
      </div>

      <div>
        <AppTextGrass width="auto"
                      height="2rem"
        />
      </div>
    </NuxtLink>
  </header>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.v-app-header__home {
  color: inherit;
  text-decoration: none;
}
</style>
