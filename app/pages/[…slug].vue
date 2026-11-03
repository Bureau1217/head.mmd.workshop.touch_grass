<template>
  <div class="v-slug">
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
.v-slug {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;

  // ContentRenderer's own wrapper
  > :deep(div) {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
  }
}
</style>
