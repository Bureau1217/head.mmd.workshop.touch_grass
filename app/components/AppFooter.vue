<template>
  <footer class="v-app-footer">
    <div class="v-app-footer__container app-with-gutter app-container app-container--flex-wrap--nowrap app-container--justify-content--space-between app-container--align-items--center">
      <div class="v-app-footer__left">
        <span class="v-app-footer__dot" aria-hidden="true"></span>
        <span>GENÈVE</span>
        <span>{{ temperature }}°C</span>
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
          <!-- la flèche pointe vers où va le vent -->
          <g :style="{ transform: `rotate(${windArrowRotation}deg)` }">
            <path
                d="M15 23V7M10 12L15 7L20 12"
                stroke-width="1.95"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
          </g>
        </svg>
        <span>VENT {{ windSpeed }} km/h {{ windCardinal }}</span>
      </div>

      <div class="v-app-footer__right">
        <div>RAFALES {{ windGusts }} km/h · SOLEIL ↓ {{ sunset }}</div>
        <div>MAJ IL Y A {{ updatedMinutesAgo }} MIN · OPEN-METEO</div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
interface OpenMeteoResponse {
  current: {
    time: number // unix, en s
    temperature_2m: number
    wind_speed_10m: number
    wind_direction_10m: number // d'où vient le vent, en deg
    wind_gusts_10m: number
  }
  daily: {
    sunset: number[] // unix, en s
  }
}

const TIMEZONE = 'Europe/Zurich'

const { data, refresh } = await useFetch<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
  key: 'app-footer-weather',
  query: {
    latitude: 46.2044,
    longitude: 6.1432,
    current: 'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    daily: 'sunset',
    timezone: TIMEZONE,
    timeformat: 'unixtime',
    forecast_days: 1,
  },
})

const PLACEHOLDER = '—'

const temperature = computed(() => data.value ? Math.round(data.value.current.temperature_2m) : PLACEHOLDER)
const windSpeed = computed(() => data.value ? Math.round(data.value.current.wind_speed_10m) : PLACEHOLDER)
const windGusts = computed(() => data.value ? Math.round(data.value.current.wind_gusts_10m) : PLACEHOLDER)

// open-meteo donne la direction d'où vient le vent : la flèche pointe à l'opposé
const windArrowRotation = computed(() => data.value ? (data.value.current.wind_direction_10m + 180) % 360 : 0)

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
const windCardinal = computed(() => {
  if (!data.value) return ''
  return CARDINALS[Math.round(data.value.current.wind_direction_10m / 45) % 8]
})

// fuseau horaire fixé : même rendu côté serveur et côté client
const sunset = computed(() => {
  const time = data.value?.daily.sunset[0]
  if (!time) return PLACEHOLDER
  return new Intl.DateTimeFormat('fr-CH', { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE }).format(time * 1000)
})

// `now` reste null jusqu'au montage : le serveur et le client affichent le même placeholder (pas de mismatch d'hydratation)
const now = ref<number | null>(null)

const updatedMinutesAgo = computed(() => {
  if (!now.value || !data.value) return PLACEHOLDER
  return Math.max(0, Math.floor((now.value - data.value.current.time * 1000) / 60000))
})

let clockTimer: ReturnType<typeof setInterval> | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  now.value = Date.now()
  clockTimer = setInterval(() => now.value = Date.now(), 30 * 1000)
  // open-meteo met à jour les valeurs "current" toutes les 15 min
  refresh()
  refreshTimer = setInterval(refresh, 10 * 60 * 1000)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (refreshTimer) clearInterval(refreshTimer)
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

.v-app-footer__right {
  font-family: 'Geist Mono', monospace;
  font-size: .45rem;
  line-height: .6rem;
  text-align: right;
  white-space: nowrap;
}
</style>
