/* Touch_Grass demo panel for SATpedia (group 2). The controls call the hooks app.vue puts on window.__satpedia. */
(function () {
  const PLACES = [
    ['me', 'Where I am'],
    ['46.2044,6.1432', 'Geneva'],
    ['40.7128,-74.0060', 'New York'],
    ['35.6762,139.6503', 'Tokyo'],
    ['-33.8688,151.2093', 'Sydney'],
    ['64.1466,-21.9426', 'Reykjavík'],
  ];
  const S = () => window.__satpedia;
  const demo = TouchGrassDemo({
    group: 'Group 2', title: 'SATpedia', people: 'Luca, Julia',
    text: 'A scientific satellite passing over you picks the Wikipedia article you read. Up to three commercial satellites crossing the zone above you interfere with it: the page gets redacted, crossed out, its letters fall, its images degrade, until it breaks. When the scientific satellite changes, the page heals. A second USB stick saves the article and pauses the attacks.',
    real: ['Where you are', 'Satellites in orbit and where they are now (KeepTrack, or CelesTrak here)', 'The Wikipedia article'],
    simulated: ['Extra commercial satellites passing overhead (real ones rarely stay long enough to show it)', 'The USB sticks of the installation'],
    controls: [
      { type: 'button', label: 'Send a satellite over', onClick: () => send() },
      { type: 'range', label: 'Zone above you (more satellites interfere)', min: 200, max: 3000, step: 100, value: 800,
        format: v => v + ' km', onInput: v => S() && S().setZone(v) },
      { type: 'select', label: 'Be in', options: PLACES, value: 'me', onChange: v => {
        if (!S()) return;
        if (v === 'me') S().useMyLocation();
        else { const [lat, lon] = v.split(',').map(Number); S().setLocation(lat, lon); }
      } },
      { type: 'button', label: 'Another scientific satellite', onClick: () => S() && S().jump() },
      { type: 'button', label: 'Orbital telemetry', onClick: () => S() && S().toggleOverlay() },
      { type: 'select', label: 'USB sticks', options: [['0', 'none'], ['1', '1 stick (connected)'], ['2', '2 sticks (save, attacks pause)']], value: '0',
        onChange: v => S() && S().setUsb(+v) },
    ],
    corner: 'bottom-right',
    open: true,
    source: 'https://github.com/Bureau1217/head.mmd.workshop.touch_grass.group2',
  });
  // a satellite sent over attacks after about 10 seconds in the zone, then harder every 10 seconds
  function send() {
    const name = S() && S().sendSatellite(90);
    if (name) sentAt = Date.now();
  }
  let sentAt = 0, autoSent = false;
  setInterval(() => {
    const s = S() && S().state();
    if (!s) return;
    if (!s.catalog) { demo.setStatus('loading every satellite in orbit…'); return; }
    // as soon as the satellites are known: two pass over, so the page starts breaking without waiting for a real one
    if (!autoSent) { autoSent = true; send(); setTimeout(send, 6000); }
    const firstHit = sentAt && Date.now() - sentAt < 12000 && (s.breakdown || 0) === 0;
    demo.setStatus([
      `you are at        ${s.lat.toFixed(2)}, ${s.lon.toFixed(2)}`,
      `scientific        ${s.science || '—'}`,
      `interfering       ${s.inZone.length ? s.inZone.join(', ') : 'none right now'}`,
      `page breakdown    ${Math.round((s.breakdown || 0) * 100)} %${s.broken ? ' · broken' : ''}${firstHit ? ' · first hit in a few seconds…' : ''}`,
    ].join('\n'));
  }, 1000);
})();
