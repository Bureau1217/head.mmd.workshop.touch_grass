# Group demos (public/demos/)

Each group project has a demo that runs in any browser, at /demos/group-N/, linked from the Projects page.
Real conditions are kept where a browser allows them; the rest is simulated. Every demo has the same panel
(public/demos/demo-bar.js): what the project is, what is real and what is simulated here, and the controls.

| Demo | From | How it was made |
|---|---|---|
| group-1 Memory of Trees | group1 `public/` + `server.js` | The page files as they are. `local-server.js` is `server.js` run in the page (simulation mode, the 4 simulated visitors), with a small stand-in for Socket.IO; only the Node parts (express, socket.io, the likelihood file) are gone |
| group-2 SATpedia | group2 Nuxt app | Built for /demos/group-2/ with a small patch: see `group-2/README.md` |
| group-3 Touch Grass | — | Not rebuilt: the Projects page links to the group's own live version on GitHub Pages |
| group-4 Browsy | group4 `src/content.ts` | Bundled unchanged: `npx esbuild@0.25.0 src/content.ts --bundle --format=iife --target=es2020 --outfile=public/demos/group-4/browsy.js`. `browser-host.js` plays Chrome and `background.ts` (storage, messages, tabs, network) in a pretend browser |
| group-5 Patatattaque | group5 `BLTL_ESP32/data/` | The site as it is, with `demo-loop.js` instead of `sim.js`: it plays the attacks by itself on a 10-second loop. `messages.js`: `poster-stop-prod-wide.png` → `.jpg` (the file's real name) |

`nuxt.config.ts` keeps /demos out of the prerender, and `AppButton` links to /demos/ as plain links.
