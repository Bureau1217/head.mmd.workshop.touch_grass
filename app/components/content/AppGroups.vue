<template>
  <div class="v-app-groups app-with-gutter">
    <p
        v-if="error"
        class="v-app-groups__error"
    >
      {{ error }}
    </p>

    <template v-else>
      <div class="v-app-groups__list">
        <div
            v-for="(group, index) in groups"
            :key="index"
            class="v-app-groups__group"
        >
          <h4 class="v-app-groups__group__title">Group {{ index + 1 }}</h4>
          <p
              v-for="(name, nameIndex) in group"
              :key="nameIndex"
          >
            {{ name.firstName }}
            <br>{{ name.lastName }}
<!--            ({{name.dev}})-->
          </p>
        </div>
      </div>

      <div class="v-app-groups__shuffle">
        <AppButton @click="shuffle">Shuffle groups</AppButton>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
interface Person {
  lastName: string // nom
  firstName: string // prénom
  dev: boolean // profil dev
}

const props = withDefaults(defineProps<{
  names?: Person[]
  groupCount?: number
  min?: number // nombre de personnes min par groupe (défaut : répartition la plus égale possible)
  max?: number // nombre de personnes max par groupe (défaut : répartition la plus égale possible)
}>(), {
  names: () => [],
  groupCount: 5,
})

const emptyGroups = (): Person[][] => Array.from({ length: props.groupCount }, () => [])

// groupes affichés, remplis un nom après l'autre
const groups = ref<Person[][]>(emptyGroups())

// par défaut, min/max donnent la répartition la plus égale (ex: 11 personnes / 5 groupes → 2 ou 3)
const min = computed(() => props.min ?? Math.floor(props.names.length / props.groupCount))
const max = computed(() => props.max ?? Math.ceil(props.names.length / props.groupCount))

const error = computed(() => {
  // MDC passe la valeur en string si le JSON est invalide
  if (!Array.isArray(props.names)) return `names must be a list (check the JSON / YAML syntax).`
  const count = props.names.length
  if (count === 0) return `No names given.`
  if (min.value > max.value) return `min (${min.value}) is greater than max (${max.value}).`
  if (count < props.groupCount * min.value) return `Not enough people (${count}) for ${props.groupCount} groups of at least ${min.value}.`
  if (count > props.groupCount * max.value) return `Too many people (${count}) for ${props.groupCount} groups of at most ${max.value}.`
  return null
})

const randomIndex = (length: number) => Math.floor(Math.random() * length)

// mélange
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

// chaque groupe commence à `min`, puis le reste des personnes est réparti au hasard dans les groupes qui n'ont pas atteint `max`
function randomSizes(): number[] {
  const sizes = Array.from({ length: props.groupCount }, () => min.value)
  let remaining = props.names.length - props.groupCount * min.value

  while (remaining > 0) {
    const available = sizes
        .map((size, index) => size < max.value ? index : -1)
        .filter(index => index !== -1)
    sizes[available[randomIndex(available.length)]!]!++
    remaining--
  }

  return sizes
}

// noms restant à placer, dans l'ordre d'apparition
let queue: { groupIndex: number, person: Person }[] = []
let hasDrawn = false

function reset() {
  queue = []
  hasDrawn = false
  groups.value = emptyGroups()
}

function placeNext() {
  const next = queue.shift()
  if (!next) return
  groups.value[next.groupIndex]!.push(next.person)
}

// tire les groupes, dans un ordre aléatoire entre les groupes
function draw() {
  const sizes = randomSizes()
  const devs = shuffleArray(props.names.filter(person => person.dev))
  const finalGroups: Person[][] = sizes.map(() => [])

  // d'abord 1 dev par groupe (dans un ordre de groupes aléatoire), tant qu'il reste des devs
  for (const groupIndex of shuffleArray(sizes.map((_, index) => index))) {
    if (devs.length === 0) break
    if (sizes[groupIndex]! > 0) finalGroups[groupIndex]!.push(devs.shift()!)
  }

  // ensuite, les places restantes sont remplies au hasard avec tout le reste (devs restants + non-devs)
  const rest = shuffleArray([...devs, ...props.names.filter(person => !person.dev)])
  finalGroups.forEach((group, groupIndex) => {
    group.push(...rest.splice(0, sizes[groupIndex]! - group.length))
  })

  queue = shuffleArray(finalGroups.flatMap((group, groupIndex) => group.map(person => ({ groupIndex, person }))))
  hasDrawn = true
}

// à chaque appel, place un nom ; ne fait plus rien une fois que tous les noms sont placés
function shuffle() {
  if (error.value) return
  if (!hasDrawn) draw()
  placeNext()
}

// l'aléatoire n'est tiré qu'au clic, côté client (pas de mismatch d'hydratation SSR)

watch(() => [props.names, props.groupCount, props.min, props.max], reset, { deep: true })
</script>

<style lang="scss" scoped>
.v-app-groups {
  min-height: calc( 100dvh - var(--app-header-height) - var(--app-footer-height));
  box-sizing: border-box;
  padding-top: 1rem;
}

.v-app-groups__list {
  display: grid;
  gap: calc(var(--app-gutter) / 2);
  margin: 0 0 1rem;
  grid-template-columns: repeat(3, 3fr);
}

.v-app-groups__group {
  padding: .5rem .75rem;
  border: 1px solid var(--app-color-tertiary);
  border-radius: 1rem;

  ul {
    margin: 0;
  }
}

.v-app-groups__group__title {
  margin: 0 0 .5rem;
  color: var(--app-color-primary);
}

.v-app-groups__error {
  color: var(--app-color-primary);
}

.v-app-groups__shuffle {
  position: sticky;
  top: calc( 100% - 2rem );
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
