<template>
  <div class="v-appheader">
    <div class="app-container app-container--flex-wrap--nowrap app-container--align-items--center">
      <div>
        <AppTextTouch
                width="auto"
                height="3rem"
        />
      </div>

      <div class="app-container__coll-12-12">
        <AppGrass/>
      </div>

      <div>
        <AppTextGrass width="auto"
                      height="3rem"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import AppTextTouch from "~/components/AppTextTouch.vue";
</script>

<style lang="scss" scoped>
.v-appheader {
}
</style>
