/* Touch_Grass — demo panel, shared by every group demo in /demos/.
   A small "DEMO" tab in a corner of the screen. Opened, it says what the project is, which conditions are
   real and which are simulated here, and holds the controls that stand in for what a visitor doesn't have
   (sensors, hardware, other visitors…).

   It lives in a shadow root, so the project's CSS and the panel's never touch each other.

   TouchGrassDemo({
     group: 'Group 1', title: 'Memory of Trees', people: 'Léa, Margarida, Julianna',
     text: 'One or two sentences about the project.',
     real: ['Your microphone', …],          // conditions taken from the real world
     simulated: ['Four other visitors', …], // conditions the demo stands in for
     controls: [                            // optional
       { type: 'button', label: 'Start a fire', onClick() {} },
       { type: 'range', label: 'Potatoes', min: 0, max: 20, step: 1, value: 4, format: v => v + ' 🥔', onInput(v) {} },
       { type: 'toggle', label: 'Bad network', value: false, onChange(on) {} },
       { type: 'select', label: 'Place', options: [['geneva', 'Geneva'], …], value: 'geneva', onChange(v) {} },
     ],
     corner: 'bottom-right',                // or 'top-right', 'top-left', 'bottom-left'
     open: false,                           // opened on arrival
     source: 'https://github.com/…',        // the group's repository
   })
   → { setStatus(text), setValue(label, value), open(), close() }
*/
(function () {
  const PROJECTS = '/projects';

  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .bar {
      position: fixed; z-index: 2147483647;
      font-family: 'Geist', system-ui, sans-serif; font-size: 13px; line-height: 1.35; color: #000;
      font-variation-settings: 'wght' 500;
      -webkit-font-smoothing: antialiased;
      max-width: calc(100vw - 16px);
    }
    .bar.bottom-right { right: 8px; bottom: 8px; }
    .bar.bottom-left { left: 8px; bottom: 8px; }
    .bar.top-right { right: 8px; top: 8px; }
    .bar.top-left { left: 8px; top: 8px; }
    .tab {
      display: inline-flex; align-items: center; gap: 6px;
      border: 1.5px solid #9673F0; border-radius: 999px; background: #fff; color: #000;
      padding: 6px 12px 6px 9px; font: inherit; font-family: 'Geist Mono', ui-monospace, monospace; font-size: 11px;
      letter-spacing: .02em; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,.12);
    }
    .tab:hover { background: #26FF00; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #FF00A6; animation: pulse 1.6s ease-in-out infinite; }
    @keyframes pulse { 50% { opacity: .35; } }
    .panel {
      width: 340px; max-width: 100%; max-height: calc(100vh - 16px); overflow: auto;
      background: #fff; border: 1.5px solid #9673F0; border-radius: 14px;
      box-shadow: 0 6px 30px rgba(0,0,0,.2); padding: 14px 14px 12px;
    }
    .bar:not(.is-open) .panel, .bar.is-open .tab { display: none; }
    .head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
    .group { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 10.5px; color: #FF00A6; text-transform: uppercase; letter-spacing: .04em; }
    .close { border: 0; background: none; font: inherit; font-size: 18px; line-height: 1; cursor: pointer; padding: 0 2px; color: #9673F0; }
    h1 { font-size: 20px; line-height: 1.1; margin: 4px 0 2px; font-variation-settings: 'wght' 700; color: #FF00A6; }
    .people { font-size: 11.5px; color: #555; margin: 0 0 8px; }
    p.text { margin: 0 0 10px; }
    .lists { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
    .lists h2 { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; margin: 0 0 3px; font-weight: normal; }
    .lists ul { margin: 0; padding: 0; list-style: none; font-size: 11.5px; }
    .lists li { padding-left: 12px; position: relative; margin-bottom: 2px; }
    .lists li::before { content: ''; position: absolute; left: 0; top: .45em; width: 6px; height: 6px; border-radius: 50%; }
    .real li::before { background: #26FF00; box-shadow: 0 0 0 1px #1a9e00; }
    .sim li::before { background: #fff; box-shadow: 0 0 0 1.5px #9673F0; }
    .controls { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #e6e0fb; padding-top: 10px; }
    .controls:empty { display: none; }
    .ctl-row { display: flex; flex-wrap: wrap; gap: 6px; }
    button.btn {
      font: inherit; font-size: 12px; border: 1.5px solid #9673F0; background: #fff; color: #000; border-radius: 999px;
      padding: 5px 11px; cursor: pointer;
    }
    button.btn:hover { background: #26FF00; }
    button.btn:active { transform: translateY(1px); }
    label.range { display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; font-size: 12px; }
    label.range input { grid-column: 1 / -1; width: 100%; accent-color: #FF00A6; margin: 0; }
    label.range output { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 11px; color: #555; }
    label.toggle { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; }
    label.toggle input { accent-color: #FF00A6; width: 15px; height: 15px; margin: 0; }
    label.select { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; }
    label.select select { font: inherit; font-size: 12px; border: 1.5px solid #9673F0; border-radius: 8px; padding: 3px 6px; background: #fff; }
    .status { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 10.5px; color: #555; white-space: pre-wrap; margin-top: 8px; }
    .status:empty { display: none; }
    .foot { display: flex; justify-content: space-between; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px solid #e6e0fb; font-size: 11.5px; }
    .foot a { color: #9673F0; text-decoration: none; }
    .foot a:hover { text-decoration: underline; }
    @media (max-width: 420px) { .lists { grid-template-columns: 1fr; } }
  `;

  const FONTS = `
    @font-face { font-family: 'Geist'; src: url('/fonts/Geist/variable/Geist[wght].ttf') format('truetype'); }
    @font-face { font-family: 'Geist Mono'; src: url('/fonts/GeistMono/variable/GeistMono[wght].ttf') format('truetype'); }
  `;

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'text') node.textContent = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const c of [].concat(children)) if (c) node.append(c);
    return node;
  };

  window.TouchGrassDemo = function (o) {
    // fonts have to be declared in the page: @font-face is ignored inside a shadow root
    document.head.append(el('style', { text: FONTS }));

    const host = el('div', { 'data-touch-grass-demo': '' });
    const root = host.attachShadow({ mode: 'open' });
    root.append(el('style', { text: CSS }));

    const values = new Map(); // label → { set(v) }
    const controls = el('div', { class: 'controls' });
    const row = () => {
      const last = controls.lastElementChild;
      if (last && last.classList.contains('ctl-row')) return last;
      const r = el('div', { class: 'ctl-row' });
      controls.append(r);
      return r;
    };
    for (const c of o.controls || []) {
      if (c.type === 'button') {
        row().append(el('button', { class: 'btn', type: 'button', text: c.label, onclick: () => c.onClick && c.onClick() }));
      } else if (c.type === 'range') {
        const fmt = c.format || (v => String(v));
        const out = el('output', { text: fmt(c.value) });
        const input = el('input', { type: 'range', min: c.min, max: c.max, step: c.step || 1, value: c.value });
        input.addEventListener('input', () => { const v = +input.value; out.textContent = fmt(v); c.onInput && c.onInput(v); });
        controls.append(el('label', { class: 'range' }, [el('span', { text: c.label }), out, input]));
        values.set(c.label, { set: v => { input.value = v; out.textContent = fmt(+v); } });
      } else if (c.type === 'toggle') {
        const input = el('input', { type: 'checkbox' });
        input.checked = !!c.value;
        input.addEventListener('change', () => c.onChange && c.onChange(input.checked));
        controls.append(el('label', { class: 'toggle' }, [input, el('span', { text: c.label })]));
        values.set(c.label, { set: v => { input.checked = !!v; } });
      } else if (c.type === 'select') {
        const select = el('select', {}, c.options.map(([v, t]) => { const op = el('option', { value: v, text: t }); if (v === c.value) op.selected = true; return op; }));
        select.addEventListener('change', () => c.onChange && c.onChange(select.value));
        controls.append(el('label', { class: 'select' }, [el('span', { text: c.label }), select]));
        values.set(c.label, { set: v => { select.value = v; } });
      }
    }

    const status = el('div', { class: 'status' });
    const list = (cls, title, items) => items && items.length
      ? el('div', { class: cls }, [el('h2', { text: title }), el('ul', {}, items.map(t => el('li', { text: t })))])
      : null;

    const bar = el('div', { class: `bar ${o.corner || 'bottom-right'}` });
    const open = () => bar.classList.add('is-open');
    const close = () => bar.classList.remove('is-open');
    bar.append(
      el('button', { class: 'tab', type: 'button', onclick: open, 'aria-label': 'Open the demo panel' }, [
        el('span', { class: 'dot' }), el('span', { text: `DEMO · ${o.title}` }),
      ]),
      el('div', { class: 'panel', role: 'dialog', 'aria-label': `${o.title} demo` }, [
        el('div', { class: 'head' }, [
          el('span', { class: 'group', text: `Touch_Grass · ${o.group} · demo` }),
          el('button', { class: 'close', type: 'button', text: '×', onclick: close, 'aria-label': 'Close the demo panel' }),
        ]),
        el('h1', { text: o.title }),
        o.people ? el('p', { class: 'people', text: o.people }) : null,
        el('p', { class: 'text', text: o.text }),
        el('div', { class: 'lists' }, [list('real', 'Real here', o.real), list('sim', 'Simulated here', o.simulated)]),
        controls,
        status,
        el('div', { class: 'foot' }, [
          el('a', { href: PROJECTS, text: '← Touch_Grass projects' }),
          o.source ? el('a', { href: o.source, target: '_blank', rel: 'noopener', text: 'Source code ↗' }) : null,
        ]),
      ]),
    );
    root.append(bar);
    const mount = () => document.body.append(host);
    if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
    if (o.open) open();

    return {
      setStatus: text => { status.textContent = text || ''; },
      setValue: (label, v) => values.get(label) && values.get(label).set(v),
      open, close,
    };
  };
})();
