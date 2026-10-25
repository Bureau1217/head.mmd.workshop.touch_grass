<template>
  <NuxtLink
      class="v-app-button"
      :to="to"
  >
    <slot/>
  </NuxtLink>
</template>

<script lang="ts" setup>
defineProps<{
  to: string
}>()
</script>

<style lang="scss" scoped>
.v-app-button {
  display: inline-block;
  padding: .25rem .75rem;
  border: 1px solid currentColor;
  border-radius: 999px;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}
</style>
