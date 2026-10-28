<template>
  <div class="v-app-image-gallery">
    <img :src="imageToShow.url" role=presentation alt="undefined"/>
  </div>
</template>

<script lang="ts" setup>

type AppImage = {
    url: string,
}

const props = defineProps<{
    imagesPath: AppImage[],
}>()

const indexImageToShow = ref(0)
const imageToShow: ComputedRef<AppImage> = computed(() => props.imagesPath[indexImageToShow.value] || {
    url: '',
})

let timer: ReturnType<typeof setTimeout>;

onMounted(() => {
    timer = setInterval(() => {
        let nextIndex = indexImageToShow.value + 1

        if(nextIndex > props.imagesPath.length) nextIndex = 0

        indexImageToShow.value = nextIndex
    }, 2_000);
})

onUnmounted(() => {
    clearInterval(timer);
})

</script>

<style lang="scss" scoped>
.v-app-image-gallery {
}
</style>
