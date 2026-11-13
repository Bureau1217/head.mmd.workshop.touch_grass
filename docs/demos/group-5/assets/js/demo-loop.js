/* BLTL — Touch_Grass demo loop. Stands in for the ESP32 (like sim.js) but plays by itself, until every text of
   the page has been attacked:
     0 – 2.5 s       the company's site as it is, while the potatoes pile up
     2.5 s – …       one attack every ATTACK_EVERY_MS, stronger and stronger (levels 1 → 3), through every text
                     deface.js targets (the takeover comes at attack 13), with graffiti, posters and photos
     then HOLD_MS    the site fully attacked
     and             the company repairs everything, and it starts again
   deface.js keeps asking fetch('/state') 4 times a second: this answers it. Load it before deface.js. */
(function () {
    var CALM_MS = 2500, ATTACK_EVERY_MS = 500, HOLD_MS = 4000;
    // every text deface.js replaces (its `targets`, same selector): about 44 on this page
    var TARGETS = 'h1, h2, h4, .hero p, .card p, .about p, .markets li, .btn, .phone a, .footer address';
    var ATTACKS = 0, ATTACKS_END_MS = 0, LOOP_MS = 0;
    function measure() {
        ATTACKS = Math.max(13, document.querySelectorAll(TARGETS).length);
        ATTACKS_END_MS = CALM_MS + (ATTACKS - 1) * ATTACK_EVERY_MS;
        LOOP_MS = ATTACKS_END_MS + HOLD_MS;
    }
    var POTATOES = [3, 20];                 // on screen at the start and at the last attack
    var VOLTS_PER_POTATO = 0.9;             // as in sim.js / BLTL_ESP32.ino

    var start = performance.now();
    var loop = -1;

    // the first few attacks only change words, then posters and photos come too, then the strongest
    function levelOf(i) { return i < 4 ? 1 : i < 20 ? 2 : 3; }

    function state() {
        if (!LOOP_MS) measure();
        var now = performance.now() - start;
        var thisLoop = Math.floor(now / LOOP_MS);
        var t = now % LOOP_MS;
        if (thisLoop !== loop) {            // a new loop: back to the top of the page
            loop = thisLoop;
            if (thisLoop > 0) window.scrollTo({ top: 0, behavior: 'instant' });
        }
        var k = Math.max(0, Math.min(1, (t - CALM_MS) / (ATTACKS_END_MS - CALM_MS)));
        var done = t < CALM_MS ? 0 : Math.min(ATTACKS, 1 + Math.floor((t - CALM_MS) / ATTACK_EVERY_MS));
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
