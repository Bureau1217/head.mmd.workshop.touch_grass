/* Touch_Grass demo — the websites in Browsy's pretend browser (browser-host.js).
   Pages laid out like the sites everyone has open, and crowded the way they are: cookie banners, pop-ups,
   notifications, ads, live counters. Closing all that takes clicks — which is exactly what stresses Browsy.
   Everything is drawn here in HTML/CSS: no real site is loaded, no logo is used.
   window.DEMO_SITES = [{ host, title, color, kind }]; window.DEMO_RENDER(tab) → HTML; window.DEMO_CROWD(page, tab) → stop() */
(function () {
  const SITES = [
    { host: 'en.wikipedia.org', title: 'Mycorrhizal network — Wikipedia', color: '#54595d', kind: 'wiki' },
    { host: 'youtube.com', title: '(3) Home - YouTube', color: '#ff0033', kind: 'video' },
    { host: 'google.com', title: 'how many tabs is too many - Google Search', color: '#4285f4', kind: 'search' },
    { host: 'mail.google.com', title: 'Inbox (1,284) - Mail', color: '#c5221f', kind: 'mail' },
    { host: 'amazon.com', title: 'Your Cart (7 items)', color: '#ff9900', kind: 'shop' },
    { host: 'nytimes.com', title: 'Live Updates: The Morning', color: '#121212', kind: 'news' },
    { host: 'x.com', title: '(24) Home / X', color: '#0f1419', kind: 'social' },
    { host: 'maps.google.com', title: 'Geneva → Lausanne - Maps', color: '#34a853', kind: 'maps' },
    { host: 'docs.google.com', title: 'Final_report_v7_FINAL (2) - Docs', color: '#1a73e8', kind: 'docs' },
    { host: 'app.slack.com', title: '#general (42 new) - Slack', color: '#4a154b', kind: 'chat' },
    { host: 'instagram.com', title: 'Instagram', color: '#d62976', kind: 'social' },
    { host: 'calendar.google.com', title: 'Week of Nov 9 - Calendar', color: '#1967d2', kind: 'calendar' },
    { host: 'reddit.com', title: 'r/productivity: I have 400 tabs open, AMA', color: '#ff4500', kind: 'social' },
    { host: 'netflix.com', title: 'Continue watching', color: '#e50914', kind: 'video' },
    { host: 'booking.com', title: 'Geneva: 312 properties found', color: '#003580', kind: 'shop' },
    { host: 'linkedin.com', title: '(9) Notifications | LinkedIn', color: '#0a66c2', kind: 'social' },
    { host: 'chatgpt.com', title: 'New chat', color: '#10a37f', kind: 'chat' },
    { host: 'figma.com', title: 'Touch_Grass — Figma', color: '#a259ff', kind: 'docs' },
    { host: 'spotify.com', title: 'Focus Flow — playlist', color: '#1db954', kind: 'video' },
    { host: 'meteoswiss.admin.ch', title: 'Geneva — 7-day forecast', color: '#dc0018', kind: 'news' },
  ];

  const pick = (list, i) => list[((i % list.length) + list.length) % list.length];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const thumb = (i, ratio = '16/9') => `<div class="th" style="aspect-ratio:${ratio};background:linear-gradient(${(i * 47) % 360}deg,hsl(${(i * 67) % 360} 60% 55%),hsl(${(i * 67 + 80) % 360} 55% 35%))"></div>`;
  const WORDS = ['tabs', 'attention', 'inbox', 'deadline', 'update', 'meeting', 'notifications', 'battery', 'scroll', 'focus', 'later', 'urgent', 'network', 'cookies', 'subscribe', 'trending'];
  const TITLES = ['I tried closing every tab for a week. Here is what happened', '10 browser habits that are quietly ruining your focus', 'Why your laptop fan sounds like a jet engine', 'The inbox zero myth, explained', 'Live: servers under record load as everyone refreshes at once', 'How many tabs is too many? Scientists weigh in', 'This one setting will change how you browse forever', 'You have been scrolling for 3 hours', 'The quiet cost of always being available', 'Notifications are designed to be impossible to ignore'];
  const PEOPLE = ['Ana', 'Marc', 'Léa', 'Sam', 'Noor', 'Theo', 'Yuki', 'Ines', 'Jonas', 'Mia', 'Omar', 'Zoé'];
  const SNIPPET = 'The update will only take a minute, it said, forty minutes ago. Nobody remembers opening this tab, but closing it feels like losing something. Read later. Read later. Twelve people are looking at this right now.';

  const T = {
    wiki: (t) => `<div class="s-wiki"><aside><b>Main page</b><span>Contents</span><span>Current events</span><span>Random article</span><span>Donate</span></aside><article>
      <h1>${esc(t.title.split(' — ')[0])}</h1><p class="from">From Wikipedia, the free encyclopedia</p>
      <div class="infobox">${thumb(t.id, '4/3')}<table><tr><th>Type</th><td>Symbiosis</td></tr><tr><th>Found in</th><td>~90% of plants</td></tr><tr><th>Speed</th><td>Slower than your tabs</td></tr></table></div>
      ${['Overview', 'History', 'Structure', 'Signalling', 'Criticism', 'See also'].map((h, i) => `<h2>${h}</h2><p>${SNIPPET} ${pick(TITLES, i + t.id)}.<sup>[${i + 1}]</sup> ${SNIPPET}</p>`).join('')}
      <label class="field">Search Wikipedia<input placeholder="Search…"></label></article></div>`,
    video: (t) => `<div class="s-video"><div class="bar"><span class="logo" style="color:${t.color}">▶</span><input placeholder="Search"><span class="pill">🔔 9+</span></div>
      <div class="chips">${['All', 'Live', 'Music', 'Productivity', 'Mixes', 'Recently uploaded', 'Watched', 'New to you'].map(c => `<span>${c}</span>`).join('')}</div>
      <div class="grid">${Array.from({ length: 16 }, (_, i) => `<div class="card">${thumb(t.id * 5 + i)}<span class="dur">${(i * 7) % 59 + 1}:${String((i * 13) % 60).padStart(2, '0')}</span><b>${esc(pick(TITLES, i + t.id))}</b><small>${pick(PEOPLE, i)} · ${(i * 37) % 900 + 12}K views · ${i % 11 + 1} days ago</small></div>`).join('')}</div></div>`,
    search: (t) => `<div class="s-search"><div class="bar"><b style="color:${t.color}">Search</b><input value="how many tabs is too many"></div>
      <p class="meta">About 4,380,000,000 results (0.41 seconds)</p>
      ${Array.from({ length: 9 }, (_, i) => `<div class="res">${i < 2 ? '<span class="ad">Sponsored</span>' : ''}<small>${pick(SITES, i + 3).host} › ${pick(WORDS, i)}</small><a>${esc(pick(TITLES, i + t.id))}</a><p>${SNIPPET.slice(0, 150)}…</p></div>`).join('')}
      <div class="res"><b>People also ask</b>${['Is 50 tabs too many?', 'Do open tabs slow down my computer?', 'Why can\'t I close my tabs?'].map(q => `<p class="q">${q} ⌄</p>`).join('')}</div></div>`,
    mail: (t) => `<div class="s-mail"><aside><button class="compose">✎ Compose</button>${['Inbox 1,284', 'Starred', 'Snoozed', 'Sent', 'Drafts 17', 'Spam 312', 'Promotions 96'].map(f => `<span>${f}</span>`).join('')}</aside><div class="list">
      ${Array.from({ length: 22 }, (_, i) => `<div class="row ${i % 3 ? '' : 'unread'}"><span>☐ ☆</span><b>${pick(PEOPLE, i + t.id)}</b><span class="sub">${esc(pick(['Re: Re: Fwd: quick question', 'URGENT: deadline moved (again)', 'Your weekly screen time report', 'Reminder: meeting in 5 minutes', '50% OFF everything — today only!', 'Your order has shipped', 'New login to your account', 'Can you take a look at this?'], i))}</span><span class="date">${i < 6 ? (9 + i) + ':' + String(i * 7 % 60).padStart(2, '0') : 'Nov ' + (12 - i % 10)}</span></div>`).join('')}
      <label class="field">Quick reply<textarea rows="3" placeholder="type fast, he feels it…"></textarea></label></div></div>`,
    shop: (t) => `<div class="s-shop"><div class="bar" style="background:${t.color}"><b>shop</b><input placeholder="Search everything"><span>🛒 7</span></div>
      <div class="deal">⚡ Lightning deal ends in 00:14:${String(59 - t.id % 50).padStart(2, '0')} — 63% claimed</div>
      <div class="grid">${Array.from({ length: 12 }, (_, i) => `<div class="card">${thumb(t.id * 3 + i, '1/1')}<b>${esc(['Ergonomic chair', 'Noise-cancelling headphones', 'Second monitor', 'USB-C hub, 12 ports', 'Blue light glasses', 'Standing desk', 'Laptop stand', 'Smart plant pot', 'Focus timer', 'Fake grass mat', 'Mechanical keyboard', 'Webcam cover'][i])}</b><span class="stars">★★★★☆ ${(i * 913) % 9000 + 120}</span><span class="price">CHF ${(i * 37) % 300 + 19}.90</span><small>${i % 3 ? 'Only ' + (i % 4 + 1) + ' left in stock!' : '🔥 ' + (i * 7 % 40 + 5) + ' bought in the last hour'}</small></div>`).join('')}</div></div>`,
    news: (t) => `<div class="s-news"><div class="masthead">${esc(t.title.split(':')[0])}</div><div class="ticker"><b>LIVE</b> ${TITLES.slice(0, 5).map(esc).join(' • ')}</div>
      <div class="cols"><div><h1>${esc(pick(TITLES, t.id))}</h1>${thumb(t.id, '16/8')}<p>${SNIPPET} ${SNIPPET}</p><h2>${esc(pick(TITLES, t.id + 1))}</h2><p>${SNIPPET}</p><div class="adbox">ADVERTISEMENT</div><p>${SNIPPET} ${SNIPPET}</p></div>
      <aside>${Array.from({ length: 6 }, (_, i) => `<div>${thumb(t.id + i, '16/10')}<b>${esc(pick(TITLES, i + 2))}</b></div>`).join('')}<div class="adbox tall">ADVERTISEMENT</div></aside></div></div>`,
    social: (t) => `<div class="s-social"><aside>${['Home', 'Explore', 'Notifications 24', 'Messages 7', 'Bookmarks', 'Profile'].map(x => `<span>${x}</span>`).join('')}<button style="background:${t.color}">Post</button></aside><div class="feed">
      <label class="field">What's happening?<textarea rows="2" placeholder="type fast, he feels it…"></textarea></label>
      ${Array.from({ length: 12 }, (_, i) => `<div class="post"><span class="av" style="background:hsl(${(i * 53) % 360} 60% 60%)"></span><div><b>${pick(PEOPLE, i + t.id)}</b> <small>@${pick(PEOPLE, i + t.id).toLowerCase()}_${i} · ${i + 1}m</small><p>${esc(pick(['just closed 80 tabs and I feel naked', 'hot take: notifications should come by post', 'my laptop fan is louder than my thoughts', 'reminder to drink water and close a tab', 'thread 🧵 on why I can\'t focus (1/37)', 'this website has 6 pop-ups before the content', 'touch grass they said. I opened a tab about grass.'], i + t.id))}</p>${i % 3 === 0 ? thumb(t.id + i, '16/9') : ''}<small>💬 ${(i * 17) % 300} 🔁 ${(i * 31) % 900} ♥ ${(i * 97) % 9000}</small></div></div>`).join('')}</div>
      <aside class="trends"><b>Trending</b>${WORDS.slice(0, 7).map((w, i) => `<p>#${w}<small>${(i * 13 + 4)}K posts</small></p>`).join('')}</aside></div>`,
    maps: (t) => `<div class="s-maps"><div class="panel"><input value="Geneva → Lausanne"><p><b>52 min</b> (64 km) via A1 — heavy traffic</p><p>🚆 38 min · 🚲 3 h 40 · 🚶 13 h</p>${Array.from({ length: 6 }, (_, i) => `<p class="step">↱ ${['Head north on Rue du Rhône', 'Turn right onto Pont du Mont-Blanc', 'Keep left at the fork', 'Merge onto A1', 'Take exit 9 toward Lausanne', 'Arrive at destination'][i]}</p>`).join('')}</div><div class="map">${Array.from({ length: 14 }, (_, i) => `<span class="pin" style="left:${(i * 37) % 90 + 4}%;top:${(i * 53) % 80 + 8}%">📍</span>`).join('')}<span class="route"></span></div></div>`,
    docs: (t) => `<div class="s-docs"><div class="tools">${['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Extensions', 'Help'].map(x => `<span>${x}</span>`).join('')}<span class="share" style="background:${t.color}">Share</span><span class="who">● ● ● 4 people editing</span></div>
      <div class="sheet"><h1>${esc(t.title.split(' - ')[0].split(' — ')[0])}</h1><p class="comment">💬 12 unresolved comments</p><textarea rows="5" placeholder="Start typing… (type fast, he feels it)"></textarea>${Array.from({ length: 8 }, (_, i) => `<h2>${i + 1}. ${pick(['Introduction', 'Context', 'Method', 'Results', 'Results (new)', 'Discussion', 'TODO', 'Appendix'], i)}</h2><p>${SNIPPET}</p>`).join('')}</div></div>`,
    chat: (t) => `<div class="s-chat"><aside style="background:${t.color}">${['# general 42', '# random 9', '# deadlines 3', '# memes', '@ Ana', '@ Marc 2', '@ Léa'].map(x => `<span>${x}</span>`).join('')}</aside><div class="msgs">
      ${Array.from({ length: 16 }, (_, i) => `<div class="msg"><span class="av" style="background:hsl(${(i * 71) % 360} 55% 55%)"></span><div><b>${pick(PEOPLE, i + t.id)}</b> <small>${9 + (i >> 2)}:${String(i * 7 % 60).padStart(2, '0')}</small><p>${esc(pick(['@channel can everyone check this asap', 'just a quick sync?', 'did you see my email', 'bumping this 👆', 'the build is broken again', 'who opened 300 tabs on the shared computer', 'ok', 'lol', 'meeting moved to now'], i))}</p></div></div>`).join('')}
      <label class="field"><textarea rows="2" placeholder="Message #general (type fast, he feels it…)"></textarea></label></div></div>`,
    calendar: (t) => `<div class="s-cal"><div class="bar"><b>November 2026</b><span>Today</span><span>‹ ›</span><span>Week ⌄</span></div><div class="week">${['Mon 9', 'Tue 10', 'Wed 11', 'Thu 12', 'Fri 13'].map((d, c) => `<div class="day"><b>${d}</b>${Array.from({ length: 7 }, (_, i) => `<span class="ev" style="background:hsl(${(c * 40 + i * 60) % 360} 70% 85%);top:${10 + i * 12 + (c * 3) % 5}%">${pick(['Stand-up', 'Sync', '1:1', 'Deadline', 'Review', 'Focus time (cancelled)', 'Call', 'Workshop'], i + c)}</span>`).join('')}</div>`).join('')}</div></div>`,
  };

  window.DEMO_SITES = SITES;
  window.DEMO_RENDER = tab => (T[tab.kind] || T.wiki)(tab);

  // ---- the crowd: what keeps popping up on top of the page ----
  const TOASTS = ['📩 New message from Marc', '🔔 You have 9 new notifications', '👀 14 people are viewing this right now', '⚠️ Your session will expire in 2 minutes', '🔋 Battery low: 12%', '📅 Meeting starts in 5 minutes', '💬 Ana mentioned you in #general', '🛒 Someone in Geneva just bought this', '⬇️ Update available — restart now?', '🎁 Only today: 50% off', '📶 Your connection is unstable'];
  window.DEMO_CROWD = function (page, tab) {
    const layer = document.createElement('div');
    layer.className = 'crowd';
    page.append(layer);
    const timers = [];
    const later = (ms, fn) => timers.push(setTimeout(fn, ms));
    const every = (ms, fn) => timers.push(setInterval(fn, ms));
    const add = (cls, html) => {
      const el = document.createElement('div');
      el.className = cls;
      el.innerHTML = html + '<button class="x" type="button" aria-label="Close">×</button>';
      el.querySelector('.x').addEventListener('click', () => el.remove());
      el.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => el.remove()));
      layer.append(el);
      return el;
    };
    // the cookie banner, on every site, every time
    later(400, () => add('cookie', `<b>We value your privacy</b><p>We and our 847 partners use cookies to personalise content and ads, and to analyse our traffic.</p><div><button data-close>Accept all</button><button data-close>Reject all</button><button data-close>Manage options</button></div>`));
    // a pop-up, on some sites
    if (tab.id % 2 === 0) later(3500 + (tab.id % 5) * 700, () => add('modal', `<b>${pick(['Before you go…', 'Don\'t miss out!', 'Stay in the loop', 'Allow notifications?', 'Sign in to continue'], tab.id)}</b><p>${pick(['Subscribe to our newsletter and get 10% off your next tab.', 'Turn on notifications so you never miss anything, ever.', 'Create a free account to keep reading this page.'], tab.id)}</p><input placeholder="your@email"><button data-close>Continue</button><button data-close class="link">No thanks, I prefer missing out</button>`));
    // a sticky ad, on others
    if (tab.id % 3 === 0) later(1800, () => add('sticky-ad', `<span>AD</span> ${pick(['Your computer may be slow. Scan now!', 'Meet singles who also have 40 tabs open', 'This one weird trick closes all your tabs'], tab.id)}`));
    // notifications, all the time
    every(5200 + (tab.id % 4) * 900, () => {
      if (layer.querySelectorAll('.toast').length >= 3) layer.querySelector('.toast').remove();
      const el = add('toast', esc(pick(TOASTS, Math.floor(Math.random() * TOASTS.length))));
      setTimeout(() => el.remove(), 7000);
    });
    // a chat bubble that keeps counting
    let unread = (tab.id * 3) % 7 + 1;
    const bubble = add('bubble', `💬 <span>${unread}</span>`);
    every(4000, () => { unread++; const n = bubble.querySelector('span'); if (n) n.textContent = unread; });
    return () => { timers.forEach(id => { clearTimeout(id); clearInterval(id); }); layer.remove(); };
  };
})();
