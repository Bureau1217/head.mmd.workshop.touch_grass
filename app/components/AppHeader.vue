<template>
  <header class="v-app-header">
    <div class="app-container app-container--flex-wrap--nowrap app-container--align-items--flex-end">
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
    </div>
  </header>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.v-app-header {
}
</style>
