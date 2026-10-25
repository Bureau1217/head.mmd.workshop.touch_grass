<template>
  <component
      :is="to ? NuxtLink : 'button'"
      class="v-app-button"
      :to="to"
      :type="to ? undefined : 'button'"
  >
    <span
        class="v-app-button__grass"
        aria-hidden="true"
    >
      <AppGrass :size="45" :sizeMax="105" :sizeMin="95"/>
    </span>
    <span class="v-app-button__label">
      <slot/>
    </span>
  </component>
</template>

<script lang="ts" setup>
// sans `to`, le composant est un <button> (pour les actions, ex: @click)
defineProps<{
  to?: string
}>()

const NuxtLink = resolveComponent('NuxtLink')
</script>

<style lang="scss" scoped>
.v-app-button {
  position: relative;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
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
