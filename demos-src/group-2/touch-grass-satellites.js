/* Touch_Grass demo — a second way to the satellites for SATpedia (group 2).
   The app asks its Cloudflare Worker (KeepTrack, behind a private key) for every satellite: <proxy>/sats/brief.
   That Worker only answers pages on bureau1217.github.io, so on the Touch_Grass site the request is refused.
   When that happens, the same list is built from CelesTrak, public and open to every site: real satellites and
   their real orbits, grouped by what they do, in the shape useSatellites.ts expects ({ name, tle1, tle2, purpose }).
   Loaded before the app. */
(function () {
  const CELESTRAK = 'https://celestrak.org/NORAD/elements/gp.php?FORMAT=tle&GROUP=';
  // CelesTrak group → the purpose useSatellites.ts sorts by (scientific keywords, or commercial)
  const GROUPS = {
    science: 'Science', weather: 'Meteorology', resource: 'Earth observation', geodetic: 'Geodesy',
    starlink: 'Communication', oneweb: 'Communication', 'iridium-NEXT': 'Communication', globalstar: 'Communication',
  };

  // CelesTrak refuses (403) a group asked again by the same address before its data changes (about 2 hours):
  // each group is kept in the browser's cache, used as it is for FRESH_MS, and used anyway when refused.
  const FRESH_MS = 2 * 60 * 60 * 1000;
  async function groupText(realFetch, group) {
    const url = CELESTRAK + encodeURIComponent(group);
    let cache = null, cached = null;
    try { cache = await caches.open('touch-grass-celestrak'); cached = await cache.match(url); } catch { /* no cache here */ }
    const age = cached ? Date.now() - Number(cached.headers.get('x-saved-at') || 0) : Infinity;
    if (cached && age < FRESH_MS) return cached.text();
    try {
      const res = await realFetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const text = await res.text();
      if (cache && /^1 /m.test(text)) await cache.put(url, new Response(text, { headers: { 'x-saved-at': String(Date.now()) } }));
      return text;
    } catch (err) {
      if (cached) return cached.text();
      throw err;
    }
  }

  async function fromCelestrak(realFetch) {
    const lists = await Promise.all(Object.entries(GROUPS).map(async ([group, purpose]) => {
      try {
        const text = await groupText(realFetch, group);
        const lines = text.split(/\r?\n/).map(l => l.trimEnd()).filter(Boolean);
        const sats = [];
        for (let i = 0; i + 2 < lines.length; i += 3) {
          if (!lines[i + 1].startsWith('1 ') || !lines[i + 2].startsWith('2 ')) { i -= 2; continue; } // resync
          sats.push({ name: lines[i].trim(), tle1: lines[i + 1], tle2: lines[i + 2], purpose });
        }
        return sats;
      } catch { return []; }
    }));
    const seen = new Set();
    return lists.flat().filter(s => !seen.has(s.name) && seen.add(s.name));
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input && input.url;
    if (!url || !/\/sats\/brief(\?|$)/.test(url)) return realFetch(input, init);
    try {
      const res = await realFetch(input, init);
      if (res.ok) return res;
    } catch { /* refused (CORS): this page isn't on bureau1217.github.io */ }
    const sats = await fromCelestrak(realFetch);
    console.info(`[Touch_Grass demo] satellites from CelesTrak: ${sats.length}`);
    return new Response(JSON.stringify(sats), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
})();
