<template>
  <NuxtLink ref="root" :to="to" class="v-app-entry-link">
    <span class="v-app-entry-link__grass" aria-hidden="true">
      <AppGrass :size="grassSize" :sizeMax="120" :sizeMin="75" :overlap="grassOverlap"/>
    </span>
    <span class="v-app-entry-link__label">{{ title }}</span>
  </NuxtLink>
</template>

<script lang="ts" setup>
// The row that leads on from the page's list: a band of grass, always on, around
// a small pill, staying in view above the footer. The band leans and
// ripples with the live wind (weather data loaded by AppFooter).
defineProps<{
  title: string
  to: string
}>()

const { data: weather } = useNuxtData('app-footer-weather')
const root = ref<{ $el: HTMLElement } | null>(null)

// On a phone: 10% smaller, and fewer blades, or they crowd the narrow screen
const grassSize = ref(90)
const grassOverlap = ref(88)
let phone: MediaQueryList | null = null
function fitGrass() {
  grassSize.value = phone?.matches ? 81 : 90
  grassOverlap.value = phone?.matches ? 83 : 88
}

let frame = 0
let observer: IntersectionObserver | null = null

function sway(time: number) {
  const current = weather.value?.current
  // open-meteo gives where the wind comes from: the blades lean the other way
  const from = (current?.wind_direction_10m ?? 270) * Math.PI / 180
  const speed = Math.min(current?.wind_speed_10m ?? 5, 50)
  const towardX = -Math.sin(from)
  const towardY = Math.cos(from)
  const paths = root.value?.$el.querySelectorAll<SVGPathElement>('.v-app-grass__blade path') ?? []
  paths.forEach((path, index) => {
    const wave = .6 + .4 * Math.sin(time * .0025 - index * .35)
    const reach = (5 + speed * .5) * wave // in the blade's own units (132 wide)
    const turn = towardX * (6 + speed * .6) * wave
    path.style.transform = `translate(${towardX * reach}px, ${towardY * reach}px) rotate(${turn}deg)`
  })
  frame = requestAnimationFrame(sway)
}

onMounted(() => {
  phone = matchMedia('(max-width: 700px)')
  phone.addEventListener('change', fitGrass)
  fitGrass()
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !root.value) return
  // only while it's on screen
  observer = new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(frame)
    if (entry?.isIntersecting) frame = requestAnimationFrame(sway)
  })
  observer.observe(root.value.$el)
})

onBeforeUnmount(() => {
  phone?.removeEventListener('change', fitGrass)
  cancelAnimationFrame(frame)
  observer?.disconnect()
})
</script>

<style lang="scss" scoped>
.v-app-entry-link {
  isolation: isolate;
  // takes what's left between the last row and the footer, the band centred in it
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--app-band-padding) var(--app-gutter);
  // no page-wide scroll from the blades at the sides; above and below, their tips
  // are free to reach past the band
  overflow-x: clip;
  background: var(--app-color-white);
  color: var(--app-color-primary);
  text-decoration: none;
  // always in view, just above the footer, even with a long section open
  position: sticky;
  bottom: var(--app-footer-height);
  z-index: 60; // above the sections' sticky titles, below the footer
}

.v-app-entry-link__grass {
  position: absolute;
  z-index: 0;
  inset: 0;
  display: flex;
  align-items: center;
  pointer-events: none;

  // each blade is its own small svg: the wind would carry its tips out of the box
  :deep(.v-app-grass__blade) {
    overflow: visible;
  }

  :deep(.v-app-grass__blade path) {
    fill: #111;
    transform-box: fill-box;
    transform-origin: center;
  }
}

.v-app-entry-link__label {
  position: relative;
  z-index: 1;
  padding: 0 .45em;
  border-radius: 5rem;
  background: var(--app-color-white);
  font-size: var(--app-row-font);
  line-height: 1.15;
  white-space: nowrap;
}
</style>
