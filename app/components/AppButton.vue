<template>
  <NuxtLink
      class="v-app-button"
      :to="to"
  >
    <span
        class="v-app-button__grass"
        aria-hidden="true"
    >
      <AppGrass :size="45"/>
    </span>
    <span class="v-app-button__label">
      <slot/>
    </span>
  </NuxtLink>
</template>

<script lang="ts" setup>
defineProps<{
  to: string
}>()
</script>

<style lang="scss" scoped>
.v-app-button {
  position: relative;
  isolation: isolate;
  display: inline-block;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.v-app-button__label {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: .25rem .75rem;
  border: 1px solid currentColor;
  border-radius: 5rem;
  background: #FFFFFFCC;
}

.v-app-button__grass {
  position: absolute;
  z-index: 0;
  inset: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  transform: translate3d(-.5rem, 0, 0);
  width: 0;
  transition: width .25s ease-in-out, opacity 0s .25s linear;
  opacity: 0;
}

.v-app-button:hover .v-app-button__grass,
.v-app-button:focus-visible .v-app-button__grass {
  width: calc(100% + 1rem);
  opacity: 1;
  transition: width .25s ease-in-out, opacity .5s linear;
}
</style>
