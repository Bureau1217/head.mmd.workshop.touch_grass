<template>
  <div class="v-app">
    <div class="v-app__app-header-home">
      <AppHeaderHome/>
    </div>
    <div>
      <NuxtPage />
    </div>

    <div class="v-app__app-footer">
      <AppFooter/>
    </div>
  </div>
</template>

<style scoped lang="scss" >
.v-app {
  padding-bottom: var(--app-footer-height);
}

.v-app__app-header-home {
  position: sticky;
  top: 0;
  z-index: 100;
}

.v-app__app-footer {
  position: fixed;
  bottom: 0;
  height: var(--app-footer-height);
  width: 100%;
}
</style>
