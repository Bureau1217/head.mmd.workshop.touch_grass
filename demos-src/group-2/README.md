# SATpedia demo (group 2) — how /demos/group-2/ is built

The demo is the group's own Nuxt app (github.com/Bureau1217/head.mmd.workshop.touch_grass.group2,
commit a7bd6811ed0f3e38104f3a4260103688c10687f0) built for /demos/group-2/, with three additions:

- `demo.patch`: app.vue exposes a few hooks on `window.__satpedia` for the demo panel; nuxt.config.ts loads
  the two scripts below and the shared panel (`/demos/demo-bar.js`) when `TOUCH_GRASS_DEMO` is set.
- `touch-grass-satellites.js`: the group's satellite Worker only answers bureau1217.github.io; on this site the
  satellites come from CelesTrak instead (cached in the browser for 2 hours, CelesTrak refuses repeat downloads).
- `touch-grass-demo.js`: the demo panel (zone radius, place, satellite jump, telemetry, USB sticks).

To rebuild:

```sh
git clone https://github.com/Bureau1217/head.mmd.workshop.touch_grass.group2 g2 && cd g2
git apply ../demos-src/group-2/demo.patch
cp ../demos-src/group-2/touch-grass-*.js public/
npm ci
TOUCH_GRASS_DEMO=1 NUXT_APP_BASE_URL=/demos/group-2/ NUXT_PUBLIC_PROXY_URL=https://keeptrack-proxy.satp.workers.dev npx nuxi generate
rm -rf ../public/demos/group-2 && cp -R .output/public ../public/demos/group-2 && rm ../public/demos/group-2/robots.txt
```
