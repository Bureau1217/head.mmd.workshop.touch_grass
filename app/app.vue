<template>
  <div class="v-app" :class="$route.path === '/' ? 'v-app--home' : 'v-app--inner'">
    <div class="v-app__app-header-home">
      <AppHeaderHome/>
    </div>
    <div class="v-app__page">
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

/* Inner pages fill the screen, so a page's last row can take what's left of it
   (AppEntryLink). The home page sizes itself. */
.v-app--inner {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 100svh;
}

.v-app--inner .v-app__page {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
}

/* Phone: the home page is exactly one screen, whatever its height. */
@media (max-width: 700px) {
  .v-app--home {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100svh;
  }

  .v-app--home .v-app__page {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.v-app__app-header-home {
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Inner pages open straight on their title, which leads back home. */
.v-app--inner {
  --app-header-height: 0px;
}

.v-app--inner .v-app__app-header-home {
  display: none;
}

.v-app__app-footer {
  position: fixed;
  bottom: 0;
  height: var(--app-footer-height);
  width: 100%;
  z-index: 100;
}
</style>
