<template>
  <div
      class="v-app-grass"
      :class="{ 'v-app-grass--overflow': overflow }"
      ref="containerRef"
      :style="{ height: `${size * sizeMax / 100}px` }"
  >

    <svg
            v-for="(blade, index) in blades"
            :key="index"
            class="v-app-grass__blade"
            width="132"
            height="132"
            viewBox="0 0 132 132"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="none"
            :style="{
              width: `${blade.width}px`,
              marginLeft: index === 0 ? '0' : `${-blade.width * overlap / 100}px`,
              transform: `rotate(${blade.rotation}deg)`,
            }"
    >
      <path d="M102.2 12.6001L85.2002 48.0001L122.7 36.1001L91.2002 59.6001L129.9 66.5001L91.1002 72.6001L122.2 96.7001L84.9001 84.1001L101.3 119.9L74.1002 91.4001L72.0002 130.7L61.2002 92.9001L41.0002 126.7L49.0002 88.2001L15.5002 108.7L40.5002 78.3001L1.2002 80.9001L37.5002 65.7001L1.50018 49.7001L40.7002 53.0001L16.3002 22.2001L49.4001 43.4001L42.1002 4.70007L61.6002 38.9001L73.1002 1.20007L74.6002 40.5001L102.2 12.6001Z"
            stroke-width="2.4"
            stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  size?: number // taille de base d'un brin, en px
  sizeMin?: number // en %
  sizeMax?: number // en %
  rotationMin?: number // en deg
  rotationMax?: number // en deg
  overlap?: number // recouvrement entre brins, en % de la largeur d'un brin (0 à < 100)
  overflow?: boolean // true : les brins peuvent dépasser du conteneur (rotation, taille, dernier brin)
}>(), {
  size: 40,
  sizeMin: 70,
  sizeMax: 130,
  rotationMin: -20,
  rotationMax: 20,
  overlap: 90,
  overflow: false,
})

interface Blade {
  width: number
  rotation: number
}

const containerRef = ref<HTMLElement | null>(null)
const blades = ref<Blade[]>([])

const random = (min: number, max: number) => min + Math.random() * (max - min)

// ajoute des brins tant qu'ils tiennent entièrement dans la largeur du conteneur
function fill() {
  if (!containerRef.value) return
  const containerWidth = containerRef.value.clientWidth
  // largeur réellement occupée par un brin, une fois le recouvrement déduit (min 1px pour éviter une boucle infinie à 100%)
  const visibleWidth = (width: number) => Math.max(width * (1 - props.overlap / 100), 1)
  // bord droit du brin, si on l'ajoute après un brin dont le bord droit est `right`
  const nextRight = (right: number, width: number, isFirst: boolean) =>
      isFirst ? width : right + visibleWidth(width)

  // garde les brins existants qui tiennent encore (si le conteneur a rétréci)
  let right = 0
  let count = 0
  for (const blade of blades.value) {
    const bladeRight = nextRight(right, blade.width, count === 0)
    if (bladeRight > containerWidth) break
    right = bladeRight
    count++
  }
  if (count < blades.value.length) blades.value.splice(count)

  // ajoute des brins jusqu'à ce que le prochain dépasse le bord droit
  while (true) {
    const width = props.size * random(props.sizeMin, props.sizeMax) / 100
    const bladeRight = nextRight(right, width, blades.value.length === 0)
    if (bladeRight > containerWidth) break
    blades.value.push({
      width,
      rotation: random(props.rotationMin, props.rotationMax),
    })
    right = bladeRight
  }
}

// l'aléatoire est généré côté client uniquement (évite un mismatch d'hydratation SSR)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  fill()
  resizeObserver = new ResizeObserver(fill)
  if (containerRef.value) resizeObserver.observe(containerRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(() => [props.size, props.sizeMin, props.sizeMax, props.rotationMin, props.rotationMax, props.overlap], () => {
  blades.value = []
  fill()
})
</script>

<style lang="scss" scoped>
.v-app-grass {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  overflow: hidden;

  &--overflow {
    overflow: visible;
  }
}

.v-app-grass__blade {
  display: block;
  flex: 0 0 auto;
  height: auto;
  transform-origin: center center;
  user-select: none;
  pointer-events: none;

  path {
    stroke: var(--app-color-tertiary);
    fill:   var(--app-color-secondary);
  }
}
</style>
