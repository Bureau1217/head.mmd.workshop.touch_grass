<template>
  <div class="v-index">
    <ContentRenderer v-if="page" :value="page" />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
    return queryCollection('content').path(route.path).first()
})
</script>

<style lang="scss" scoped>
// Phone: the title takes what's left of the screen above the tagline.
@media (max-width: 700px) {
  .v-index {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;

    > :deep(div) {
      flex: 1 1 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
