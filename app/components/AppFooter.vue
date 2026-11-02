<template>
  <footer class="v-app-footer">
    <div class="v-app-footer__container app-with-gutter app-container app-container--flex-wrap--nowrap app-container--justify-content--space-between app-container--align-items--center">
      <div class="v-app-footer__left">
        <span class="v-app-footer__dot" aria-hidden="true"></span>
        <span>GENEVA</span>
        <svg
            class="v-app-footer__wind-icon"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
          <circle cx="15" cy="15" r="14.25" stroke-width="0.9"/>
          <!-- the arrow points where the wind comes from -->
          <g ref="windArrow" :style="{ transform: `rotate(${windArrowRotation}deg)` }">
            <path
                d="M15 23V7M10 12L15 7L20 12"
                stroke-width="1.95"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
          </g>
        </svg>
        <span>WIND {{ windSpeed }} km/h {{ windCardinal }}</span>
      </div>

      <a
          class="v-app-footer__logo"
          href="https://bureau1217.ch"
          target="_blank"
          rel="noopener"
      >
        <img src="/images/bureau-1217-logo.svg" alt="Bureau 1217" width="125" height="18">
      </a>
    </div>
  </footer>
</template>

<script lang="ts" setup>
interface OpenMeteoResponse {
  current: {
    wind_speed_10m: number
    wind_direction_10m: number // where the wind comes from, in degrees
  }
}

const { data, refresh } = await useFetch<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
  key: 'app-footer-weather',
  query: {
    latitude: 46.2044,
    longitude: 6.1432,
    current: 'wind_speed_10m,wind_direction_10m',
  },
})

const PLACEHOLDER = '—'

// the digits roll to each new reading; until the animation starts they show the reading itself
const shownSpeed = ref<number | null>(null)
const windSpeed = computed(() => {
  const speed = shownSpeed.value ?? data.value?.current.wind_speed_10m
  return speed === undefined ? PLACEHOLDER : speed.toFixed(1)
})

// open-meteo gives where the wind comes from: the arrow points there, like the cardinal next to it
const windArrowRotation = computed(() => data.value ? data.value.current.wind_direction_10m % 360 : 0)

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const windCardinal = computed(() => {
  if (!data.value) return ''
  return CARDINALS[Math.round(data.value.current.wind_direction_10m / 45) % 8]
})

let refreshTimer: ReturnType<typeof setInterval> | null = null

// the arrow shows the real wind direction and turns the shortest way to each new reading
const windArrow = ref<SVGGElement | null>(null)
let animationFrame = 0
let arrowAngle: number | null = null
let easedSpeed: number | null = null

function animateWind() {
  const current = data.value?.current
  if (windArrow.value && current) {
    const target = windArrowRotation.value
    arrowAngle ??= target
    arrowAngle += ((target - arrowAngle + 540) % 360 - 180) * 0.05
    windArrow.value.style.transform = `rotate(${arrowAngle}deg)`

    easedSpeed ??= current.wind_speed_10m
    easedSpeed += (current.wind_speed_10m - easedSpeed) * 0.04
    shownSpeed.value = Math.round(easedSpeed * 10) / 10
  }
  animationFrame = requestAnimationFrame(animateWind)
}

onMounted(() => {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) animationFrame = requestAnimationFrame(animateWind)
  refresh()
  // open-meteo updates its "current" values every 15 min: checking every 5 picks them up soon after, without using up the shared rate limit
  refreshTimer = setInterval(refresh, 5 * 60 * 1000)
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  cancelAnimationFrame(animationFrame)
})
</script>

<style lang="scss" scoped>
.v-app-footer {
  background: var(--app-color-quaternary);
  user-select: none;
}

.v-app-footer__container {
  height: var(--app-footer-height);
  gap: var(--app-gutter);
}

.v-app-footer__left {
  display: flex;
  align-items: center;
  gap: 1em;
  font-size: 1.2rem;
  line-height: 1.5rem;
  white-space: nowrap;
}

.v-app-footer__dot {
  display: block;
  width: .3em;
  height: .3em;
  margin-right: -.5em;
  border-radius: 50%;
  background: currentColor;
}

.v-app-footer__wind-icon {
  display: block;
  width: 1em;
  height: 1em;
  stroke: currentColor;

  g {
    transform-origin: 15px 15px;
  }
}

.v-app-footer__logo {
  display: block;
  flex: 0 0 auto;

  img {
    display: block;
    width: auto;
    height: 1rem;
  }
}

@media (max-width: 700px) {
  .v-app-footer__left {
    font-size: .8rem;
    gap: .6em;
  }

  .v-app-footer__dot {
    margin-right: 0;
  }

  .v-app-footer__logo img {
    height: .65rem;
  }
}

@media (max-width: 359px) {
  .v-app-footer__left {
    font-size: .7rem;
  }

  .v-app-footer__logo img {
    height: .55rem;
  }
}
</style>
