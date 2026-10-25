<template>
  <div
      class="v-app-grass"
      :class="{ 'v-app-grass--overflow': overflow }"
      ref="containerRef"
      :style="{ height: `${size * sizeMax / 100}px` }"
  >
    <img
        v-for="(blade, index) in blades"
        :key="index"
        class="v-app-grass__blade"
        src="/images/grass.svg"
        alt=""
        :style="{
          width: `${blade.width}px`,
          marginLeft: index === 0 ? '0' : `${-blade.width * overlap / 100}px`,
          transform: `rotate(${blade.rotation}deg)`,
        }"
    />
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
}
</style>
