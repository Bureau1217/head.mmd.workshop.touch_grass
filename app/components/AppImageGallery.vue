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
    imagesPath?: AppImage[],
}>()

const indexImageToShow = ref(0)
const imageToShow: ComputedRef<AppImage> = computed(() => {

    console.log('imageToShow', props.imagesPath)

    if( !props.imagesPath) return {
        url: '',
    }

    return props.imagesPath[indexImageToShow.value] || {
        url: '',
    }

})

let timer: ReturnType<typeof setTimeout>;

onMounted(() => {
    timer = setInterval(() => {
        if (props.imagesPath) {
            let nextIndex = indexImageToShow.value + 1

            if (nextIndex >= props.imagesPath.length) nextIndex = 0

            indexImageToShow.value = nextIndex
        }
    }, 30_000);
})

onUnmounted(() => {
    clearInterval(timer);
})

</script>

<style lang="scss" scoped>
.v-app-image-gallery {
  width: 100%;
  height: calc(100dvh - (var(--app-header-height) + var(--app-footer-height) ) );
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
