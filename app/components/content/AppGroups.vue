<template>
  <div class="v-app-groups">
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
          </p>
        </div>
      </div>

      <AppButton @click="shuffle">Shuffle groups</AppButton>
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  names?: {
      lastName: string, // nom
      firstName: string, // prénom
  }[]
  groupCount?: number
  min?: number // nombre de personnes min par groupe (défaut : répartition la plus égale possible)
  max?: number // nombre de personnes max par groupe (défaut : répartition la plus égale possible)
}>(), {
  names: () => [],
  groupCount: 5,
})

const groups = ref< {lastName: string, firstName: string}[][]>([])

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

function shuffle() {
  if (error.value) return
  const names = shuffleArray(props.names)
  groups.value = randomSizes().map(size => names.splice(0, size))
}

// l'aléatoire est généré côté client uniquement (évite un mismatch d'hydratation SSR)
onMounted(shuffle)

watch(() => [props.names, props.groupCount, props.min, props.max], shuffle, { deep: true })
</script>

<style lang="scss" scoped>
.v-app-groups {
  margin: 0 0 1rem;
}

.v-app-groups__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--app-gutter);
  margin: 0 0 1rem;
}

.v-app-groups__group {
  flex: 1 1 8rem;
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
</style>
