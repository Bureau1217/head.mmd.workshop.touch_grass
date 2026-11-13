/* BLTL — Touch_Grass demo loop. Stands in for the ESP32 (like sim.js) but plays by itself, every 10 seconds:
     0 – 1.5 s   the company's site as it is, while the potatoes pile up
     1.5 – 8.5 s the attacks, stronger and stronger (levels 1 → 3), up to the takeover (attack 13)
     8.5 – 10 s  the site fully attacked
     10 s        the company repairs everything, and it starts again
   deface.js keeps asking fetch('/state') 4 times a second: this answers it. Load it before deface.js. */
(function () {
    var LOOP_MS = 10000;
    var CALM_MS = 1500, ATTACKS_END_MS = 8500;
    var ATTACKS = 13;                       // STAGES[3] in deface.js: the takeover
    var POTATOES = [3, 16];                 // on screen at the start and at the last attack
    var VOLTS_PER_POTATO = 0.9;             // as in sim.js / BLTL_ESP32.ino

    var start = performance.now();
    var loop = -1;

    function levelOf(i) { return i < 4 ? 1 : i < 9 ? 2 : 3; }

    function state() {
        var now = performance.now() - start;
        var thisLoop = Math.floor(now / LOOP_MS);
        var t = now % LOOP_MS;
        if (thisLoop !== loop) {            // a new loop: back to the top of the page
            loop = thisLoop;
            if (thisLoop > 0) window.scrollTo({ top: 0, behavior: 'instant' });
        }
        var k = Math.max(0, Math.min(1, (t - CALM_MS) / (ATTACKS_END_MS - CALM_MS)));
        var done = t < CALM_MS ? 0 : Math.min(ATTACKS, 1 + Math.floor(k * (ATTACKS - 1) + 1e-9));
        var log = '';
        for (var i = 0; i < done; i++) log += levelOf(i);
        var potatoes = Math.round(POTATOES[0] + (POTATOES[1] - POTATOES[0]) * Math.min(1, t / ATTACKS_END_MS));
        return {
            charge: k,
            log: log,
            volts: potatoes * VOLTS_PER_POTATO,
            potatoes: potatoes,
            plugged: true
        };
    }

    var realFetch = window.fetch;
    window.fetch = function (url) {
        if (typeof url === 'string' && url.indexOf('/state') === 0) {
            var s = state();
            return Promise.resolve({ json: function () { return s; } });
        }
        return realFetch.apply(this, arguments);
    };
})();
