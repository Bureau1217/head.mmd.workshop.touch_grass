<template>
  <div class="v-app-project-photos">
    <a
        v-for="(photo, index) in photos"
        :key="index"
        class="v-app-project-photos__photo"
        :class="{ 'v-app-project-photos__photo--contain': photo.fit === 'contain' }"
        :style="photo.background ? { background: photo.background } : undefined"
        :href="photo.src"
        target="_blank"
        rel="noopener"
    >
      <img :src="photo.src" :alt="photo.alt || ''" loading="lazy" decoding="async">
    </a>
  </div>
</template>

<script lang="ts" setup>
// a group's photos, in one row (two on a phone); each opens full size
// in markdown:
//   ::AppProjectPhotos
//   ---
//   photos:
//     - { src: /images/projects/group-1/01.jpg, alt: "…" }
//     - { src: …, alt: "…", fit: contain, background: "#1e1e1e" }   whole image (a wide screenshot), on its own colour
//   ---
//   ::
defineProps<{
  photos?: { src: string, alt?: string, fit?: 'cover' | 'contain', background?: string }[]
}>()
</script>

<style lang="scss" scoped>
.v-app-project-photos {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--app-gutter-half);
  margin: 1rem 0 0;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.v-app-project-photos__photo {
  display: block;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #eee;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .4s ease;
  }

  &--contain img {
    object-fit: contain;
  }

  &:hover img {
    transform: scale(1.03);
  }
}
</style>
