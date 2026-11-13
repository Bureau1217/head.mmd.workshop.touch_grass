<template>
  <component
      :is="to ? NuxtLink : 'button'"
      class="v-app-button"
      :class="{ 'v-app-button--live': live }"
      :to="to"
      :external="to ? isExternal : undefined"
      :type="to ? undefined : 'button'"
  >
    <span
        class="v-app-button__grass"
        aria-hidden="true"
    >
      <AppGrass :size="45" :sizeMax="105" :sizeMin="95"/>
    </span>
    <span class="v-app-button__label">
      <span v-if="live" class="v-app-button__dot" aria-hidden="true"/>
      <slot/>
    </span>
  </component>
</template>

<script lang="ts" setup>
// sans `to`, le composant est un <button> (pour les actions, ex: @click)
// live: the green "SEE LIVE" look, to stand out (the footer's green)
const props = defineProps<{
  to?: string
  live?: boolean
}>()

// the group demos (public/demos/) are pages of their own, outside the Nuxt app: a normal link, not the router
const isExternal = computed(() => !!props.to && props.to.startsWith('/demos/'))

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

.v-app-button--live .v-app-button__label {
  display: inline-flex;
  align-items: center;
  gap: .4em;
  padding: .4rem 1rem;
  border-color: #000;
  background: var(--app-color-quaternary);
  color: #000;
  font-variation-settings: 'wght' 650;
}

.v-app-button__dot {
  width: .45em;
  height: .45em;
  border-radius: 50%;
  background: currentColor;
  animation: v-app-button-pulse 1.4s ease-in-out infinite;
}

@keyframes v-app-button-pulse {
  50% { opacity: .25; }
}

@media (prefers-reduced-motion: reduce) {
  .v-app-button__dot { animation: none; }
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
