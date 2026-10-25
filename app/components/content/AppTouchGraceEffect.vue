<template>
  <div class="v-app-touch-grace-effect">
    <canvas id="title" aria-label="TOUCH_GRASS, titre composé d’étoiles qui suivent le curseur"></canvas>
  </div>
</template>

<script lang="js" setup>

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
            const ox = ln.x + i * ADV + PAD, oy = ln.y + PAD;
            const style = ch === '_' ? 'us' : ln.style;
            const stars = [];
            for (const pl of SK[ch]) for (const [x, y] of resample(pl, 13)) {
                stars.push({
                    x: ox + x, y: oy + y, ro: 26 + rnd() * 9, ri: 11, rot: rnd() * 6.283,
                    dx: 0, dy: 0, dr: 0, ds: 1, vx: 0, vy: 0
                });
            }
            // centre accent (comme les cœurs colorés des lettres)
            letters.push({ch, style, stars, box: [ox - 40, oy - 40, ox + 140, oy + 180], hot: 0});
        });
    }
    const WORLD_W = 64 + 5 * ADV + 100 + PAD * 2, WORLD_H = 208 + 140 + PAD * 2;

    let scale = 1, dpr = 1;

    function resize() {
        const avail = cv.parentElement.clientWidth - parseFloat(getComputedStyle(cv.parentElement).paddingLeft) - parseFloat(getComputedStyle(cv.parentElement).paddingRight);
        const w = avail;
        cv.style.width = w + 'px'; // le titre prend toute la largeur, comme dans le Figma
        dpr = Math.min(2, window.devicePixelRatio || 1);
        scale = w / WORLD_W;
        const h = Math.round(WORLD_H * scale);
        cv.style.height = h + 'px';
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        draw();
    }

    const mouse = {x: -1e4, y: -1e4, in: false};

    function setMouse(e) {
        const r = cv.getBoundingClientRect();
        mouse.x = (e.clientX - r.left) / scale;
        mouse.y = (e.clientY - r.top) / scale;
        mouse.in = true;
        kick();
    }

    // écoute sur toute la fenêtre : la lettre reste accrochée même quand le curseur sort du titre
    window.addEventListener('pointermove', setMouse);
    window.addEventListener('pointerdown', setMouse);
    document.documentElement.addEventListener('pointerleave', () => {
        mouse.in = false;
        kick();
    });

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
        ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
        ctx.clearRect(0, 0, WORLD_W, WORLD_H);
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

    function kick() {
        if (!running && !reduce) {
            running = true;
            requestAnimationFrame(step);
        } else if (reduce) draw();
    }

    function step() {
        let moving = false;
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
                // ressort : suit le curseur avec un peu d'inertie, revient en place à la sortie
                s.vx = (s.vx + (tx - s.dx) * 0.16) * 0.72;
                s.vy = (s.vy + (ty - s.dy) * 0.16) * 0.72;
                s.dx += s.vx;
                s.dy += s.vy;
                s.dr += (tr - s.dr) * 0.14;
                s.ds += (ts - s.ds) * 0.14;
                if (Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(tr - s.dr) + Math.abs(ts - s.ds) + Math.abs(tx - s.dx) + Math.abs(ty - s.dy) > 0.02) moving = true;
            }
        }
        draw();
        if (moving || mouse.in) requestAnimationFrame(step); else running = false;
    }

    window.addEventListener('resize', resize);
    resize();
    if (document.fonts) document.fonts.ready.then(resize);
})

</script>

<style scoped>
canvas#title { display: block; margin-inline: auto; touch-action: pan-y; cursor: crosshair; }
</style>
