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
.v-index {
}
</style>
