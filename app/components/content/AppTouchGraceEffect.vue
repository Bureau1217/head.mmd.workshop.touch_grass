<template>
  <div class="v-app-touch-grace-effect">
    <canvas id="title" aria-label="TOUCH_GRASS, titre composé d’étoiles qui suivent le curseur"></canvas>
  </div>
</template>

<script lang="js" setup>

// données météo chargées et rafraîchies par AppFooter
const { data: weather } = useNuxtData('app-footer-weather');

let stop = null;
onBeforeUnmount(() => stop?.());

onMounted(() => {
    const cv = document.getElementById('title');
    const ctx = cv.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- squelettes des lettres (boîte 100 × 140) ----
    const arc = (cx, cy, rx, ry, a0, a1, n) => {
        const p = [];
        for (let i = 0; i <= n; i++) {
            const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
            p.push([cx + rx * Math.cos(a), cy - ry * Math.sin(a)]);
        }
        return p;
    };
    const SK = {
        T: [[[0, 0], [100, 0]], [[50, 0], [50, 140]]],
        O: [arc(50, 70, 50, 70, 0, 360, 60)],
        U: [[[0, 0], [0, 90], ...arc(50, 90, 50, 50, 180, 360, 30), [100, 90], [100, 0]]],
        C: [arc(50, 70, 50, 70, 40, 320, 50)],
        H: [[[0, 0], [0, 140]], [[100, 0], [100, 140]], [[0, 70], [100, 70]]],
        _: [[[0, 140], [100, 140]]],
        G: [arc(50, 70, 50, 70, 40, 352, 50), [[100, 80], [56, 80]]],
        R: [[[0, 140], [0, 0], [55, 0], ...arc(55, 35, 45, 35, 90, -90, 24), [0, 70]], [[48, 70], [100, 140]]],
        A: [[[0, 140], [50, 0], [100, 140]], [[18, 92], [82, 92]]],
        S: [[...arc(50, 35, 48, 35, 25, 270, 30), ...arc(50, 105, 50, 35, 90, -155, 34)]]
    };
    let seed = 101;
    const rnd = () => {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    function resample(pl, step) {
        const out = [];
        let carry = 0;
        for (let i = 0; i < pl.length - 1; i++) {
            const [x0, y0] = pl[i], [x1, y1] = pl[i + 1];
            const L = Math.hypot(x1 - x0, y1 - y0);
            if (!L) continue;
            const dx = (x1 - x0) / L, dy = (y1 - y0) / L;
            let d = carry;
            while (d <= L) {
                out.push([x0 + dx * d, y0 + dy * d]);
                d += step;
            }
            carry = d - L;
        }
        const l = pl[pl.length - 1];
        out.push(l);
        return out;
    }

    // ---- composition : TOUCH / _GRASS (unités de squelette) ----
    const ADV = 168, PAD = 62;
    const STYLES = {touch: ['#FF8100', '#9267FF'], grass: ['#26FF00', '#9267FF'], us: ['#55C9A6', '#9267FF']};
    const lines = [{word: 'TOUCH', x: 0, y: 0, style: 'touch'}, {word: '_GRASS', x: 64, y: 208, style: 'grass'}];
    const letters = [];
    for (const ln of lines) {
        [...ln.word].forEach((ch, i) => {
            const style = ch === '_' ? 'us' : ln.style;
            const stars = [];
            for (const pl of SK[ch]) for (const [x, y] of resample(pl, 13)) {
                stars.push({
                    lx: x, ly: y, x: 0, y: 0, ro: 26 + rnd() * 9, ri: 11, rot: rnd() * 6.283,
                    dx: 0, dy: 0, dr: 0, ds: 1, vx: 0, vy: 0
                });
            }
            // centre accent (comme les cœurs colorés des lettres)
            letters.push({ch, style, stars, index: letters.length, lineX: ln.x + i * ADV + PAD, lineY: ln.y + PAD, box: [0, 0, 0, 0], hot: 0});
        });
    }
    const WORLD_W = 64 + 5 * ADV + 100 + PAD * 2, WORLD_H = 208 + 140 + PAD * 2;

    // ---- téléphone : TOU / CH_ / GRA / SS empilés, décalés d'une ligne à l'autre ----
    // [colonne, ligne] de chaque lettre, en largeurs de lettre et en hauteurs de ligne
    const STACK = [[0, 0], [1, 0], [2, 0], [.45, 1], [1.45, 1], [2.45, 1], [0, 2], [1, 2], [2, 2], [1.45, 3], [2.45, 3]];
    const ROW = 208;
    const STACK_W = 2.45 * ADV + 100 + PAD * 2, STACK_H = 3 * ROW + 140 + PAD * 2;
    let stacked = false;

    function placeLetter(L, ox, oy) {
        L.box = [ox - 40, oy - 40, ox + 140, oy + 180];
        for (const s of L.stars) {
            s.x = ox + s.lx;
            s.y = oy + s.ly;
        }
    }

    function placeLetters() {
        for (const L of letters) {
            if (stacked) placeLetter(L, STACK[L.index][0] * ADV + PAD, STACK[L.index][1] * ROW + PAD);
            else placeLetter(L, L.lineX, L.lineY);
        }
    }

    placeLetters();

    let scale = 1, dpr = 1;
    let originX = 0, originY = 0, canvasW = 0, canvasH = 0;
    let bounds = {x0: 0, y0: 0, x1: WORLD_W, y1: WORLD_H};

    function resize() {
        const narrow = matchMedia('(max-width: 700px)').matches;
        if (narrow !== stacked) {
            stacked = narrow;
            placeLetters();
        }
        const root = cv.parentElement;
        const avail = root.clientWidth - parseFloat(getComputedStyle(root).paddingLeft) - parseFloat(getComputedStyle(root).paddingRight);
        // le titre prend toute la largeur, sauf s'il pousse la tagline sous le footer
        const tagline = root.nextElementSibling?.querySelector('h2');
        const taglineSpace = tagline ? tagline.getBoundingClientRect().bottom - root.getBoundingClientRect().bottom : 0;
        const footer = document.querySelector('.v-app-footer')?.offsetHeight || 0;
        const margin = parseFloat(getComputedStyle(document.documentElement).fontSize) / 2;
        const canvasTop = cv.getBoundingClientRect().top + window.scrollY;
        // téléphone : la mise en page CSS donne au titre ce qui reste au-dessus de la tagline, qui reste donc toujours visible
        const maxH = narrow ? root.clientHeight : Math.max(120, window.innerHeight - canvasTop - footer - taglineSpace - margin);
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvasW = root.clientWidth;
        const worldW = stacked ? STACK_W : WORLD_W, worldH = stacked ? STACK_H : WORLD_H;
        scale = Math.min(avail / worldW, maxH / worldH);
        const titleH = worldH * scale;
        // sur téléphone, le titre se centre dans l'espace libre : la tagline se retrouve juste au-dessus du footer
        const h = narrow ? Math.floor(maxH) : Math.round(titleH);
        originX = (canvasW - worldW * scale) / 2;
        originY = Math.max(0, (h - titleH) / 2);
        root.style.height = narrow ? '' : h + 'px';
        // le canvas couvre toute la zone visible entre le header et le footer : les étoiles ont de la place pour bouger sans être coupées
        canvasH = Math.max(h, window.innerHeight - canvasTop - footer);
        bounds = {x0: -originX / scale, y0: -originY / scale, x1: (canvasW - originX) / scale, y1: (canvasH - originY) / scale};
        cv.style.width = canvasW + 'px';
        cv.style.height = canvasH + 'px';
        cv.width = Math.round(canvasW * dpr);
        cv.height = Math.round(canvasH * dpr);
        draw();
    }

    const mouse = {x: -1e4, y: -1e4, in: false};

    function setMouse(e) {
        const r = cv.getBoundingClientRect();
        mouse.x = (e.clientX - r.left - originX) / scale;
        mouse.y = (e.clientY - r.top - originY) / scale;
        mouse.in = true;
        kick();
    }

    // écoute sur toute la fenêtre : la lettre reste accrochée même quand le curseur sort du titre
    window.addEventListener('pointermove', setMouse);
    window.addEventListener('pointerdown', setMouse);
    function clearMouse() {
        mouse.in = false;
        kick();
    }

    // au doigt il n'y a pas de survol : la lettre se relâche quand le doigt se lève
    function releaseTouch(e) {
        if (e.pointerType !== 'mouse') clearMouse();
    }

    document.documentElement.addEventListener('pointerleave', clearMouse);
    window.addEventListener('pointerup', releaseTouch);
    window.addEventListener('pointercancel', releaseTouch);

    function starPath(x, y, ro, ri, rot) {
        ctx.beginPath();
        for (let i = 0; i < 26; i++) {
            const r = i % 2 ? ri : ro, a = rot + i * Math.PI / 13;
            const px = x + r * Math.cos(a), py = y + r * Math.sin(a);
            i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.closePath();
    }

    function draw() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * originX, dpr * originY);
        ctx.lineJoin = 'round';
        for (const L of letters) {
            const [fill, stroke] = STYLES[L.style];
            ctx.fillStyle = fill;
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1.8;
            for (const s of L.stars) {
                starPath(s.x + s.dx, s.y + s.dy, s.ro * s.ds, s.ri, s.rot + s.dr);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    // ---- interaction : les formes suivent le curseur dans la lettre survolée ----
    let running = false;
    let frame = 0;

    // vent en unités de squelette. open-meteo donne la direction d'où il vient : les étoiles partent à l'opposé
    function getWind() {
        const current = weather.value?.current;
        if (!current) return {x: 0, y: 0, strength: 0};
        const from = current.wind_direction_10m * Math.PI / 180;
        const strength = 35 + Math.min(current.wind_speed_10m, 50); // visible même par vent faible
        return {x: -Math.sin(from), y: Math.cos(from), strength};
    }

    // ---- gyroscope : incliner le téléphone déplace un peu les étoiles, le vent reste le mouvement principal ----
    const TILT_STRENGTH = 10; // en unités de squelette, à inclinaison maximale
    const tiltTarget = {x: 0, y: 0};
    const tilt = {x: 0, y: 0};
    let restBeta = null;

    function onOrientation(e) {
        if (e.gamma === null || e.beta === null) return;
        // la position de repos suit lentement la façon dont le téléphone est tenu
        restBeta = restBeta === null ? e.beta : restBeta + (e.beta - restBeta) * 0.002;
        const clamp = v => Math.max(-1, Math.min(1, v));
        const x = clamp(e.gamma / 45), y = clamp((e.beta - restBeta) / 45);
        // écran tourné : les axes du téléphone ne sont plus ceux de l'écran
        const angle = (screen.orientation?.angle || 0) * Math.PI / 180;
        tiltTarget.x = x * Math.cos(angle) + y * Math.sin(angle);
        tiltTarget.y = y * Math.cos(angle) - x * Math.sin(angle);
    }

    // iOS n'autorise le gyroscope qu'après une demande faite pendant un geste de l'utilisateur
    function askOrientationPermission() {
        DeviceOrientationEvent.requestPermission().catch(() => {});
    }

    const needsPermission = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
    if (!reduce) {
        window.addEventListener('deviceorientation', onOrientation);
        if (needsPermission) window.addEventListener('click', askOrientationPermission, {once: true});
    }

    function kick() {
        if (!running && !reduce) {
            running = true;
            frame = requestAnimationFrame(step);
        } else if (reduce) draw();
    }

    function step(time) {
        tilt.x += (tiltTarget.x - tilt.x) * 0.08;
        tilt.y += (tiltTarget.y - tilt.y) * 0.08;
        const wind = getWind();
        for (const L of letters) {
            const [x0, y0, x1, y1] = L.box;
            // entrée sur la lettre, sortie seulement quand le curseur s'éloigne nettement (marge de 110 unités)
            const m0 = L.active ? 110 : 0;
            const inside = mouse.in && mouse.x > x0 - m0 && mouse.x < x1 + m0 && mouse.y > y0 - m0 && mouse.y < y1 + m0;
            L.active = inside;
            L.hot += ((inside ? 1 : 0) - L.hot) * 0.15;
            for (const s of L.stars) {
                let tx = 0, ty = 0, tr = 0, ts = 1;
                if (inside) {
                    const ddx = mouse.x - s.x, ddy = mouse.y - s.y, d = Math.hypot(ddx, ddy);
                    const pull = Math.max(0, 1 - d / 320);
                    const k = 0.55 * pull;
                    tx = ddx * k;
                    ty = ddy * k;
                    const lim = 95;
                    const m = Math.hypot(tx, ty);
                    if (m > lim) {
                        tx *= lim / m;
                        ty *= lim / m;
                    }
                    // une pointe se tourne vers le curseur
                    const want = Math.atan2(ddy, ddx) - s.rot;
                    tr = Math.atan2(Math.sin(want), Math.cos(want)) * pull;
                    ts = 1 + 0.35 * pull;
                }
                // tout le titre penche dans le sens du vent, en vagues qui le traversent ; la lettre survolée penche davantage
                const wave = Math.sin(time * 0.0025 - (s.x * wind.x + s.y * wind.y) * 0.012 + s.rot * 0.4);
                const push = wind.strength * (0.3 + 0.7 * L.hot) * (0.6 + 0.4 * wave);
                tx += wind.x * push + tilt.x * TILT_STRENGTH;
                ty += wind.y * push + tilt.y * TILT_STRENGTH;
                if (wind.strength) tr += wave * 0.25;
                tr += tilt.x * 0.15;
                // ressort : suit le curseur avec un peu d'inertie, revient en place à la sortie
                s.vx = (s.vx + (tx - s.dx) * 0.16) * 0.72;
                s.vy = (s.vy + (ty - s.dy) * 0.16) * 0.72;
                s.dx += s.vx;
                s.dy += s.vy;
                s.dr += (tr - s.dr) * 0.14;
                s.ds += (ts - s.ds) * 0.14;
                // l'étoile entière reste toujours dans la zone visible
                const R = s.ro * s.ds + 4;
                const px = Math.min(bounds.x1 - R, Math.max(bounds.x0 + R, s.x + s.dx));
                const py = Math.min(bounds.y1 - R, Math.max(bounds.y0 + R, s.y + s.dy));
                if (px !== s.x + s.dx) {
                    s.dx = px - s.x;
                    s.vx = 0;
                }
                if (py !== s.y + s.dy) {
                    s.dy = py - s.y;
                    s.vy = 0;
                }
            }
        }
        draw();
        frame = requestAnimationFrame(step);
    }

    window.addEventListener('resize', resize);
    // barres du navigateur qui bougent sur téléphone, tagline qui change de hauteur…
    let lastRootH = 0;
    const rootObserver = new ResizeObserver(() => {
        const rootH = cv.parentElement.clientHeight;
        if (rootH !== lastRootH && matchMedia('(max-width: 700px)').matches) {
            lastRootH = rootH;
            resize();
        }
    });
    rootObserver.observe(cv.parentElement);
    resize();
    if (document.fonts) document.fonts.ready.then(() => {
        if (cv.isConnected) resize();
    });
    kick();

    stop = () => {
        cancelAnimationFrame(frame);
        rootObserver.disconnect();
        window.removeEventListener('pointermove', setMouse);
        window.removeEventListener('pointerdown', setMouse);
        window.removeEventListener('resize', resize);
        document.documentElement.removeEventListener('pointerleave', clearMouse);
        window.removeEventListener('pointerup', releaseTouch);
        window.removeEventListener('pointercancel', releaseTouch);
        window.removeEventListener('deviceorientation', onOrientation);
        window.removeEventListener('click', askOrientationPermission);
    };
})

</script>

<style scoped>
.v-app-touch-grace-effect { position: relative; touch-action: pan-y; cursor: crosshair; }
@media (max-width: 700px) {
  .v-app-touch-grace-effect { flex: 1 1 0; min-height: 0; }
}
canvas#title { display: block; position: absolute; top: 0; left: 0; pointer-events: none; }
</style>
