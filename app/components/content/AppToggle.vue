<template>
  <div class="v-app-toggle">
    <h2 class="v-app-toggle__title">
      <button
          type="button"
          class="v-app-toggle__title__button"
          :aria-expanded="isOpen"
          @click="isOpen = !isOpen"
      >
        <span class="v-app-toggle__title__text">
          <template
              v-for="(word, index) in titleWords"
              :key="index"
          >
            <span
                v-if="index > 0"
                class="v-app-toggle__title__space"
            >
              <AppGrass
                      :size="15"

              />
            </span>
            <span v-html="word"/>
          </template>
        </span>

        <svg
            class="v-app-toggle__title__icon"
            width="33"
            height="33"
            viewBox="0 0 33 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
          <path d="M32.3151 16.3157L21.8034 17.7465L30.4451 23.8807L20.4717 20.2682L25.2742 29.7173L18.1342 21.8832L17.9926 32.494L15.3009 22.2232L10.2434 31.5448L12.6376 21.2173L3.82589 27.1248L10.7534 19.0782L0.199219 20.2115L10.0734 16.3157L0.199219 12.4198L10.7534 13.5532L3.82589 5.5065L12.6376 11.414L10.2434 1.0865L15.3009 10.4082L17.9926 0.137329L18.1342 10.7482L25.2742 2.914L20.4717 12.3632L30.4451 8.75066L21.8034 14.8848L32.3151 16.3157Z"
                fill="#26FF00"
                stroke-width="1.08333"
                stroke="#9673F0"
          />
        </svg>
      </button>
    </h2>

    <div
        v-show="isOpen"
        class="v-app-toggle__content"
    >
      <slot/>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title: string
}>()

const isOpen = ref(false)

const titleWords = computed(() => props.title.trim().split(/\s+/))
</script>

<style lang="scss" scoped>
.v-app-toggle__title__button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1em;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.v-app-toggle__title__space {
  display: inline-block;
  width: 1.5em;
  vertical-align: middle;
}

.v-app-toggle__title__icon {
  display: block;
  flex: 0 0 auto;
}
</style>
