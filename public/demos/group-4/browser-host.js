/* Touch_Grass demo — the browser Browsy lives in.
   Browsy is a Chrome extension: content.ts in every page, and background.ts watching the tabs and the network,
   both talking through chrome.storage and messages. Here there is one page, a pretend browser with pretend tabs,
   and this file plays Chrome and background.ts:
     - chrome.storage.local, chrome.runtime (messages, getURL) for content.ts (bundled unchanged as browsy.js)
     - tabInfo (how many tabs, the switches, the site and since when), from the pretend tabs
     - net (ping and speed), measured for real, as background.ts does
     - closing tabs, ripping a tab, and the crash, on the pretend tabs
   Load it before browsy.js. */
(function () {
  // ---------- chrome.storage.local, in memory ----------
  const store = {};
  const changeListeners = [];
  const clone = v => v === undefined ? v : JSON.parse(JSON.stringify(v));
  const storage = {
    async get(keys) {
      const list = keys == null ? Object.keys(store) : [].concat(keys);
      const out = {};
      for (const k of list) if (k in store) out[k] = clone(store[k]);
      return out;
    },
    async set(values) {
      const changes = {};
      for (const [k, v] of Object.entries(values)) {
        changes[k] = { oldValue: clone(store[k]), newValue: clone(v) };
        store[k] = clone(v);
      }
      setTimeout(() => changeListeners.forEach(fn => fn(clone(changes), 'local')), 0);
    },
    async remove(keys) { for (const k of [].concat(keys)) delete store[k]; },
  };

  // ---------- chrome.runtime ----------
  const messageListeners = [];
  window.chrome = {
    storage: { local: storage, onChanged: { addListener: fn => changeListeners.push(fn) } },
    runtime: {
      id: 'touch-grass-demo',
      getURL: path => path,
      onMessage: { addListener: fn => messageListeners.push(fn) },
      sendMessage: msg => handle(msg),
    },
  };
  const tellBrowsy = msg => messageListeners.forEach(fn => fn(msg, {}, () => {}));

  // ---------- the pretend tabs ----------
  const SITES = [
    ['news.example', 'Morning briefing', '#c62828'], ['recipes.example', 'Ten-minute pasta', '#ef6c00'],
    ['docs.example', 'Quarterly report — draft', '#1565c0'], ['shop.example', 'Your basket (3)', '#2e7d32'],
    ['video.example', 'Watch later', '#d81b60'], ['mail.example', 'Inbox (128)', '#6a1b9a'],
    ['maps.example', 'Route to the station', '#00838f'], ['wiki.example', 'Mycorrhizal network', '#455a64'],
    ['forum.example', 'Re: Re: Re: help', '#5d4037'], ['tickets.example', 'Train Geneva → Lausanne', '#283593'],
    ['weather.example', 'Geneva, 7 days', '#0277bd'], ['bank.example', 'Statement', '#37474f'],
    ['music.example', 'Focus playlist', '#00695c'], ['social.example', 'Notifications (9)', '#ad1457'],
    ['calendar.example', 'This week', '#4527a0'], ['search.example', 'how many tabs is too many', '#558b2f'],
  ];
  const START_TABS = 12;
  let tabs = [];
  let active = null;
  let nextTab = 1;
  let switches = [];       // times of the tab switches, like background.ts (last minute)
  let hostSince = Date.now(), host = '';
  let crashed = false;

  const strip = document.getElementById('tabs');
  const address = document.getElementById('address');
  const page = document.getElementById('page');
  const count = document.getElementById('tabCount');

  function newTab(activate) {
    const [siteHost, title, color] = SITES[(nextTab - 1) % SITES.length];
    const tab = { id: nextTab++, host: siteHost, title, color, lastAccessed: Date.now() - 1000 * (60 - tabs.length) };
    tabs.push(tab);
    if (activate) setActive(tab, false);
    return tab;
  }

  function setActive(tab, isSwitch = true) {
    if (!tab || tab === active) return;
    active = tab;
    tab.lastAccessed = Date.now();
    if (isSwitch) switches.push(Date.now());
    renderPage();
    render();
    sync();
  }

  function closeTab(tab) {
    const i = tabs.indexOf(tab);
    if (i < 0) return;
    tabs.splice(i, 1);
    if (tab === active) {
      active = null;
      const next = tabs[Math.min(i, tabs.length - 1)];
      if (next) setActive(next, false); else renderPage();
    }
    render();
    sync();
  }

  function render() {
    strip.replaceChildren(...tabs.map(t => {
      const b = document.createElement('button');
      b.className = 'tab' + (t === active ? ' is-active' : '');
      b.type = 'button';
      b.title = t.title;
      b.innerHTML = '<i></i><span></span>';
      b.firstChild.style.background = t.color;
      b.lastChild.textContent = t.title;
      b.addEventListener('click', () => setActive(t));
      b.addEventListener('auxclick', e => { if (e.button === 1) closeTab(t); });
      return b;
    }));
    count.textContent = tabs.length;
  }

  // a page of the pretend website: something to read, scroll and type in
  const LOREM = [
    'The meeting was moved again, so the notes from last week still apply, more or less.',
    'Nobody remembers opening this tab, but closing it feels like losing something important.',
    'Scroll a little further: the useful part is always just below the fold.',
    'Prices may vary. Results may vary. Your attention, however, is finite.',
    'Read later. Read later. Read later. The list only grows.',
    'Somewhere a server spins a little faster every time this page is refreshed.',
    'The update will only take a minute, it said, forty minutes ago.',
    'Twelve people are looking at this right now. Eleven of them have another tab open.',
  ];
  function renderPage() {
    if (!active) { address.textContent = ''; page.innerHTML = '<p class="empty">No tabs open.</p>'; return; }
    address.textContent = 'https://' + active.host + '/';
    let html = `<article style="--site:${active.color}"><p class="site">${active.host}</p><h1>${active.title}</h1>`;
    html += '<label class="write">Write something here<textarea rows="3" placeholder="type fast, he feels it…"></textarea></label>';
    for (let i = 0; i < 14; i++) {
      html += `<h2>${['Overview', 'Details', 'More', 'Related', 'Comments', 'See also', 'Updates'][i % 7]}</h2>`;
      html += '<p>' + [0, 1, 2, 3].map(j => LOREM[(active.id * 3 + i + j) % LOREM.length]).join(' ') + '</p>';
    }
    page.innerHTML = html + '</article>';
    window.scrollTo(0, 0);
  }

  // like updateTabInfo() in background.ts
  function sync() {
    const now = Date.now();
    switches = switches.filter(t => now - t < 60000);
    const h = active ? active.host : '';
    if (h !== host) { host = h; hostSince = now; }
    storage.set({ tabInfo: { count: tabs.length, switches: switches.slice(), host, hostSince } });
  }

  // ---------- the network, measured for real (background.ts: ping + Chrome's speed estimate) ----------
  async function ping() {
    const start = performance.now();
    try {
      await fetch(`https://www.gstatic.com/generate_204?t=${Date.now()}`, { mode: 'no-cors', cache: 'no-store' });
      return performance.now() - start;
    } catch { return null; }
  }
  async function measureNetwork() {
    await ping();
    const rtt = await ping();
    const downlink = navigator.connection ? navigator.connection.downlink ?? null : null;
    storage.set({ net: { rtt, downlink, at: Date.now() } });
  }
  setInterval(measureNetwork, 30000);

  // ---------- what Browsy asks the background for ----------
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function handle(msg) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'browsy-close-tabs') {            // close the tabs you looked at least recently
      const victims = tabs.filter(t => t !== active).sort((a, b) => a.lastAccessed - b.lastAccessed).slice(0, msg.count);
      for (const t of victims) { flash(t); await wait(250); closeTab(t); await wait(250); }
      return victims.length;
    }
    if (msg.type === 'browsy-capture') return null;    // no screenshot here: he tears a blank page
    if (msg.type === 'browsy-close-tab') { if (active) closeTab(active); return; }
    if (msg.type === 'browsy-crash') crash(msg.lines, msg.delay);
  }

  function flash(tab) {
    const i = tabs.indexOf(tab);
    const el = strip.children[i];
    if (el) el.classList.add('is-closing');
  }

  // THE CRASH: every tab closes one by one, the crash screen, then the whole browser goes
  async function crash(lines, delay) {
    if (crashed) return;
    crashed = true;
    await wait(delay);
    const state = (await storage.get(['browsyState'])).browsyState;
    if (!state || state.mode !== 'dead') { crashed = false; return; }   // revived in the meantime
    const victims = tabs.filter(t => t !== active).sort((a, b) =>
      Math.abs(tabs.indexOf(b) - tabs.indexOf(active)) - Math.abs(tabs.indexOf(a) - tabs.indexOf(active)));
    const gap = Math.min(450, Math.max(150, 5000 / Math.max(1, victims.length)));
    for (const t of victims) { flash(t); await wait(gap / 2); closeTab(t); await wait(gap / 2); }
    tellBrowsy({ type: 'browsy-final', lines });
    await wait((window.BROWSY_CRASH_COUNTDOWN || 7) * 1000 + 400);
    const closed = document.getElementById('closed');   // the browser has quit:
    document.documentElement.append(closed);              // after Browsy (he mounts on <html>), so it covers his crash screen
    closed.hidden = false;
  }

  // ---------- for the demo panel ----------
  window.__browser = {
    openTabs(n) { for (let i = 0; i < n; i++) newTab(false); render(); sync(); },
    closeOne() { const t = tabs.filter(x => x !== active).sort((a, b) => a.lastAccessed - b.lastAccessed)[0]; if (t) closeTab(t); },
    count: () => tabs.length,
    settings(values) { storage.get(['browsySettings']).then(({ browsySettings }) => storage.set({ browsySettings: { ...browsySettings, ...values } })); },
    command(type) { storage.set({ browsyCommand: { type, at: Date.now() } }); },
  };
  document.getElementById('newTab').addEventListener('click', () => { const t = newTab(false); setActive(t); render(); sync(); });
  document.getElementById('reopen').addEventListener('click', () => location.reload());

  // ---------- start: a few tabs already open, the settings of the demo ----------
  for (let i = 0; i < START_TABS; i++) newTab(i === 0);
  render();
  renderPage();
  store.browsySettings = { debug: false, demo: true, hidden: false, badNet: false, safeDeath: false, mute: false };
  store.tabInfo = { count: tabs.length, switches: [], host: active.host, hostSince };
  measureNetwork();
})();
