'use strict';
/**
 * DevVerse SVG engine. Every function returns a self-contained, animated SVG string.
 * GitHub renders SVG inside <img> with CSS/SMIL animation but NO scripts, so everything here is pure SMIL.
 */
const { mix } = require('./themes');

const FONT = "'JetBrains Mono','Fira Code','SF Mono',Menlo,Consolas,'Courier New',monospace";

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}

const doc = (w, h, body, defs = '') =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">` +
  `<defs>${defs}<filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` +
  `${body}</svg>`;

/** discrete animation from [[seconds, value], ...]; loops every D seconds */
function animDisc(attr, events, D) {
  const m = new Map();
  const sorted = events.slice().sort((a, b) => a[0] - b[0]);
  for (const [t, v] of sorted) m.set(+(Math.min(t, D) / D).toFixed(4), v);
  if (!m.has(0)) m.set(0, sorted[0][1]);
  const keys = [...m.keys()].sort((a, b) => a - b);
  if (keys[keys.length - 1] < 1) {
    m.set(1, m.get(keys[keys.length - 1]));
    keys.push(1);
  }
  return `<animate attributeName="${attr}" calcMode="discrete" dur="${D.toFixed(2)}s" repeatCount="indefinite" keyTimes="${keys.join(';')}" values="${keys.map((k) => m.get(k)).join(';')}"/>`;
}

const pulse = (attr, a, b, dur, begin = 0) =>
  `<animate attributeName="${attr}" values="${a};${b};${a}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>`;

/** falling code columns */
function rain({ x, y, w, h, cols, color, head, op, seed, fs = 14, len = 13 }) {
  const r = rng(seed);
  const set = '01{}<>/;=+*#$%&abcdef0123456789ｱｲｳｴｵｶｷｸｹｺ';
  const chars = [...set];
  let out = `<g opacity="${op}" font-family="${FONT}" font-size="${fs}">`;
  for (let c = 0; c < cols; c++) {
    const cx = x + (c + 0.5) * (w / cols);
    const dur = 4 + r() * 6;
    const delay = -(r() * dur);
    const col = len * (fs + 2);
    let tsp = '';
    for (let k = 0; k < len; k++) {
      const ch = chars[Math.floor(r() * chars.length)];
      const o = (0.06 + 0.94 * Math.pow(k / (len - 1), 2)).toFixed(2);
      const f = k === len - 1 ? head : color;
      tsp += `<tspan x="${cx.toFixed(1)}" dy="${fs + 2}" fill="${f}" fill-opacity="${o}">${esc(ch)}</tspan>`;
    }
    out += `<g><text y="${(y - col).toFixed(0)}">${tsp}</text><animateTransform attributeName="transform" type="translate" values="0 0;0 ${(h + col).toFixed(0)}" dur="${dur.toFixed(1)}s" begin="${delay.toFixed(1)}s" repeatCount="indefinite"/></g>`;
  }
  return out + '</g>';
}

/* ------------------------------------------------------------------ BANNER */
function banner({ name, role, username, location, theme: T, creator }) {
  const W = 1000, H = 290;
  const size = Math.min(66, Math.floor(900 / (Math.max(name.length, 4) * 0.62)));
  const tl = Math.round(name.length * size * 0.6);
  const gl = (dx, color, op, begin) => {
    const ev = [[0, 500 + 0], [3.1, 500], [3.12, 500 + dx], [3.2, 500 - dx], [3.28, 500 + dx / 2], [3.36, 500], [5.2, 500], [5.22, 500 - dx], [5.3, 500 + dx], [5.38, 500]];
    return `<text x="500" y="165" text-anchor="middle" font-size="${size}" font-weight="800" fill="${color}" opacity="${op}" textLength="${tl}" lengthAdjust="spacingAndGlyphs">${esc(name)}${animDisc('x', ev, 7 + begin)}</text>`;
  };
  const gridH = Array.from({ length: 10 }, (_, i) => `<line x1="0" x2="${W}" y1="${i * 40 - 40}" y2="${i * 40 - 40}"/>`).join('');
  const gridV = Array.from({ length: 21 }, (_, i) => `<line y1="0" y2="${H}" x1="${i * 50}" x2="${i * 50}"/>`).join('');
  const sub = role ? `&lt; ${esc(role)} /&gt;` : '';
  const meta = [username ? `github.com/${esc(username)}` : '', location ? esc(location) : ''].filter(Boolean).join('   •   ');
  const defs = `
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.bg}"/><stop offset="1" stop-color="${T.bg2}"/></linearGradient>
<radialGradient id="vig" cx="50%" cy="52%" r="55%"><stop offset="0" stop-color="${T.bg}" stop-opacity=".88"/><stop offset="1" stop-color="${T.bg}" stop-opacity="0"/></radialGradient>
<linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="${T.secondary}"/><stop offset=".5" stop-color="${T.primary}"/><stop offset="1" stop-color="${T.secondary}"/></linearGradient>
<clipPath id="cp"><rect width="${W}" height="${H}" rx="14"/></clipPath>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity=".035"/></pattern>`;
  const body = `
<g clip-path="url(#cp)">
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<g stroke="${T.primary}" stroke-opacity=".07" stroke-width="1">${gridV}<g>${gridH}<animateTransform attributeName="transform" type="translate" values="0 0;0 40" dur="3s" repeatCount="indefinite"/></g></g>
${rain({ x: 0, y: 0, w: W, h: H, cols: 38, color: T.primary, head: T.accent, op: 0.5, seed: 7 })}
<rect width="${W}" height="${H}" fill="url(#vig)"/>
<rect width="${W}" height="${H}" fill="url(#scan)"/>
<rect width="${W}" height="3" fill="${T.primary}" opacity=".10"><animate attributeName="y" values="-6;${H}" dur="5s" repeatCount="indefinite"/></rect>
<g font-family="${FONT}" text-anchor="middle">
${gl(7, T.secondary, 0.85, 0)}
${gl(-7, T.primary, 0.85, 0.4)}
<text x="500" y="165" font-size="${size}" font-weight="800" fill="${T.fg}" filter="url(#glow)" textLength="${tl}" lengthAdjust="spacingAndGlyphs">${esc(name)}</text>
<text x="500" y="209" font-size="22" fill="${T.primary}" letter-spacing="2">${sub}<tspan fill="${T.primary}">_<animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></tspan></text>
<text x="500" y="246" font-size="13" fill="${T.muted}" letter-spacing="1">${meta}</text>
</g>
<g font-family="${FONT}" font-size="12" fill="${T.primary}">
<circle cx="28" cy="28" r="4" fill="${T.primary}">${pulse('opacity', 1, 0.2, 1.4)}</circle>
<text x="40" y="32" letter-spacing="2">SYSTEM ONLINE</text>
<text x="${W - 28}" y="32" text-anchor="end" fill="${T.muted}">~/${esc(username || 'dev')}</text>
</g>
<text x="${W - 14}" y="${H - 12}" text-anchor="end" font-family="${FONT}" font-size="9" fill="${T.fg}" opacity=".32">devverse · by @${esc(creator.github)}</text>
<rect x="0" y="${H - 4}" width="${W}" height="4" fill="url(#edge)" opacity=".9">${pulse('opacity', 0.55, 1, 2.4)}</rect>
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="none" stroke="${T.primary}" stroke-opacity=".35"/>`;
  return doc(W, H, body, defs);
}

/* ------------------------------------------------------------ TYPING INTRO */
function typing({ lines, theme: T }) {
  const W = 1000, H = 70, size = 26, cw = size * 0.6;
  const dt = 0.07, hold = 1.7, er = 0.03, gap = 0.35;
  let cur = 0.2;
  const plan = lines.map((t) => {
    const n = [...t].length;
    const p = { t, n, a: cur };
    cur += n * dt + hold + n * er + gap;
    return p;
  });
  const D = cur + 0.2;
  let body = `<g font-family="${FONT}" font-size="${size}" font-weight="600">`;
  let defs = '';
  plan.forEach((p, i) => {
    const x0 = (W - p.n * cw) / 2;
    const ev = [[0, 0]];
    for (let k = 1; k <= p.n; k++) ev.push([p.a + k * dt, +(k * cw).toFixed(1)]);
    const e0 = p.a + p.n * dt + hold;
    for (let k = p.n - 1; k >= 0; k--) ev.push([e0 + (p.n - k) * er, +(k * cw).toFixed(1)]);
    const cursorX = ev.map(([t, v]) => [t, +(x0 + v).toFixed(1)]);
    const vis = [[0, 0], [p.a, 1], [e0 + p.n * er + 0.05, 0]];
    defs += `<clipPath id="c${i}"><rect x="${x0.toFixed(1)}" y="12" height="48" width="0">${animDisc('width', ev, D)}</rect></clipPath>`;
    body += `<text x="${x0.toFixed(1)}" y="44" fill="${T.primary}" clip-path="url(#c${i})" textLength="${(p.n * cw).toFixed(1)}" lengthAdjust="spacing" xml:space="preserve" filter="url(#glow)">${esc(p.t)}</text>`;
    body += `<rect y="18" width="3" height="32" fill="${T.accent}" opacity="0">${animDisc('x', cursorX, D)}${animDisc('opacity', vis, D)}</rect>`;
  });
  body += '</g>';
  return doc(W, H, body, defs);
}

/* ---------------------------------------------------------------- TERMINAL */
/** line: { k:'cmd'|'out', segs:[[text,colorKey]] } */
function terminal({ title, lines, theme: T, rain: withRain = false, seed = 3, W = 1000, fontSize = 15, lineH = 27 }) {
  const cw = fontSize * 0.6, pad = 30, bodyTop = 70;
  const maxChars = Math.floor((W - pad * 2) / cw);
  const col = (k) => T[k] || k;
  let cur = 0.8;
  const items = lines.map((ln) => {
    let left = maxChars;
    const segs = [];
    for (const [t, c] of ln.segs) {
      if (left <= 0) break;
      const chars = [...t];
      const cut = chars.length > left ? chars.slice(0, left - 1).join('') + '…' : t;
      segs.push([cut, c]);
      left -= [...cut].length;
    }
    const n = segs.reduce((a, [t]) => a + [...t].length, 0);
    const speed = ln.k === 'out' ? 0.012 : 0.055;
    const it = { segs, n, start: cur, speed };
    cur += n * speed + (ln.k === 'out' ? 0.12 : 0.5);
    return it;
  });
  const D = cur + 4.5;
  const H = bodyTop + (items.length + 1) * lineH + 14;
  let defs = `<clipPath id="panel"><rect width="${W}" height="${H}" rx="12"/></clipPath>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity=".03"/></pattern>`;
  let body = `<g clip-path="url(#panel)"><rect width="${W}" height="${H}" fill="${T.panel}"/>`;
  if (withRain) body += rain({ x: 0, y: 40, w: W, h: H - 40, cols: 44, color: T.primary, head: T.accent, op: 0.16, seed });
  body += `<rect width="${W}" height="40" fill="${mix(T.panel, T.bg, 0.5)}"/><line x1="0" x2="${W}" y1="40" y2="40" stroke="${T.border}"/>
<circle cx="24" cy="20" r="6" fill="#ff5f56"/><circle cx="46" cy="20" r="6" fill="#ffbd2e"/><circle cx="68" cy="20" r="6" fill="#27c93f"/>
<text x="${W / 2}" y="25" text-anchor="middle" font-family="${FONT}" font-size="13" fill="${T.muted}">${esc(title)}</text>
<g font-family="${FONT}" font-size="${fontSize}">`;
  items.forEach((it, i) => {
    const y = bodyTop + i * lineH;
    const ev = [[0, 0]];
    for (let k = 1; k <= it.n; k++) ev.push([it.start + k * it.speed, +(k * cw).toFixed(1)]);
    defs += `<clipPath id="l${i}"><rect x="${pad}" y="${y - fontSize - 2}" height="${lineH}" width="0">${animDisc('width', ev, D)}</rect></clipPath>`;
    let off = 0;
    body += `<g clip-path="url(#l${i})">`;
    for (const [t, c] of it.segs) {
      const n = [...t].length;
      body += `<text x="${(pad + off * cw).toFixed(1)}" y="${y}" fill="${col(c)}" textLength="${(n * cw).toFixed(1)}" lengthAdjust="spacing" xml:space="preserve">${esc(t)}</text>`;
      off += n;
    }
    body += '</g>';
  });
  const yEnd = bodyTop + items.length * lineH;
  body += `<text x="${pad}" y="${yEnd}" fill="${T.primary}" opacity="0">$${animDisc('opacity', [[0, 0], [cur, 1]], D)}</text>
<rect x="${pad + cw * 2}" y="${yEnd - fontSize}" width="${(cw * 0.9).toFixed(1)}" height="${fontSize + 3}" fill="${T.primary}" opacity="0"><animate attributeName="opacity" calcMode="discrete" dur="${D.toFixed(2)}s" repeatCount="indefinite" keyTimes="0;${(cur / D).toFixed(4)};${((cur + 0.5) / D).toFixed(4)};${((cur + 1) / D).toFixed(4)};1" values="0;1;0;1;1"/></rect>`;
  body += `</g><rect width="${W}" height="${H}" fill="url(#scan)"/></g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${T.primary}" stroke-opacity=".4">${pulse('stroke-opacity', 0.2, 0.6, 4)}</rect>`;
  return doc(W, H, body, defs);
}

/* ------------------------------------------------------------ SETUP SCENE */
function setupScene({ theme: T, username }) {
  const W = 1000, H = 370;
  const r = rng(11);
  const pal = [T.primary, T.secondary, T.accent, T.muted, T.dim, T.fg];
  const LH = 14, N = 40;
  // code lines (two copies for a seamless scroll)
  let lines = '';
  let nums = '';
  let ind = 0;
  for (let i = 0; i < N; i++) {
    ind = Math.max(0, Math.min(3, ind + (r() < 0.3 ? 1 : r() < 0.5 ? -1 : 0)));
    let x = 326 + ind * 16;
    const toks = 2 + Math.floor(r() * 4);
    let ln = '';
    if (r() > 0.12) {
      for (let k = 0; k < toks; k++) {
        const w = 14 + Math.floor(r() * 62);
        ln += `<rect x="${x}" y="${i * LH + 3}" width="${w}" height="7" rx="2" fill="${pal[Math.floor(r() * pal.length)]}" opacity=".85"/>`;
        x += w + 6;
      }
    }
    lines += ln;
    nums += `<text x="296" y="${i * LH + 10}" font-size="8" fill="${T.muted}" opacity=".7">${i + 1}</text>`;
  }
  const setH = N * LH;
  const move = `<animateTransform attributeName="transform" type="translate" values="0 0;0 -${setH}" dur="26s" repeatCount="indefinite"/>`;
  const scroll = `<g>${lines}${nums}<g transform="translate(0 ${setH})">${lines}${nums}</g>${move}</g>`;
  // equalizer bars
  let bars = '';
  for (let i = 0; i < 14; i++) {
    const hs = [0, 1, 2].map(() => 10 + Math.floor(r() * 62));
    const d = (1.1 + r() * 1.6).toFixed(2);
    const bx = 778 + i * 12;
    bars += `<rect x="${bx}" width="8" rx="1.5" fill="${i % 3 === 0 ? T.secondary : T.primary}" opacity=".9">
<animate attributeName="height" values="${hs[0]};${hs[1]};${hs[2]};${hs[0]}" dur="${d}s" repeatCount="indefinite"/>
<animate attributeName="y" values="${206 - hs[0]};${206 - hs[1]};${206 - hs[2]};${206 - hs[0]}" dur="${d}s" repeatCount="indefinite"/></rect>`;
  }
  // keyboard
  let keys = '';
  for (let row = 0; row < 3; row++) {
    for (let c = 0; c < 20; c++) {
      const kx = 348 + c * 15, ky = 304 + row * 9;
      keys += `<rect x="${kx}" y="${ky}" width="12" height="6" rx="1.5" fill="${T.panel}" stroke="${T.border}" stroke-width=".6"/>`;
      if (r() < 0.45) {
        const d = (0.5 + r() * 1.4).toFixed(2);
        keys += `<rect x="${kx}" y="${ky}" width="12" height="6" rx="1.5" fill="${T.primary}" opacity="0"><animate attributeName="opacity" values="0;.95;0" keyTimes="0;.5;1" dur="${d}s" begin="${(-r() * 2).toFixed(2)}s" repeatCount="indefinite"/></rect>`;
      }
    }
  }
  // floating symbols
  const syms = ['{ }', '</>', ';', '#!', '0x', '&&', '=>', '[]', 'sudo', '$_'];
  let fl = '';
  syms.forEach((s, i) => {
    const x = 300 + ((i * 47) % 400);
    const d = (5 + (i % 4) * 1.3).toFixed(1);
    fl += `<text x="${x}" y="80" font-size="${12 + (i % 3) * 3}" fill="${i % 2 ? T.secondary : T.primary}" opacity="0"><animate attributeName="y" values="84;6" dur="${d}s" begin="${-i * 0.9}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.8;0" dur="${d}s" begin="${-i * 0.9}s" repeatCount="indefinite"/>${esc(s)}</text>`;
  });
  const defs = `
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.bg}"/><stop offset="1" stop-color="${T.bg2}"/></linearGradient>
<radialGradient id="amb" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${T.primary}" stop-opacity=".35"/><stop offset="1" stop-color="${T.primary}" stop-opacity="0"/></radialGradient>
<clipPath id="cp"><rect width="${W}" height="${H}" rx="14"/></clipPath>
<clipPath id="code"><rect x="284" y="-4" width="432" height="134"/></clipPath>`;
  const body = `
<g clip-path="url(#cp)" font-family="${FONT}">
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<ellipse cx="500" cy="190" rx="360" ry="170" fill="url(#amb)">${pulse('opacity', 0.55, 1, 4)}</ellipse>
${fl}
<g transform="translate(0 30)">
  <rect x="0" y="260" width="${W}" height="80" fill="${T.desk}"/><line x1="0" x2="${W}" y1="260" y2="260" stroke="${T.border}" stroke-width="2"/>
  <!-- main monitor -->
  <rect x="490" y="236" width="20" height="26" fill="#0b0f14"/><rect x="440" y="256" width="120" height="8" rx="4" fill="#0b0f14" stroke="${T.border}"/>
  <rect x="270" y="40" width="460" height="204" rx="12" fill="#0b0f14" stroke="${T.primary}" stroke-opacity=".5"/>
  <rect x="284" y="54" width="432" height="176" rx="4" fill="${mix(T.bg, '#000000', 0.45)}"/>
  <rect x="284" y="54" width="432" height="22" fill="${mix(T.panel, T.bg, 0.4)}"/>
  <rect x="284" y="54" width="104" height="22" fill="${T.panel}"/><rect x="284" y="74" width="104" height="2" fill="${T.primary}"/>
  <text x="296" y="69" font-size="10" fill="${T.fg}">main.cpp</text><text x="400" y="69" font-size="10" fill="${T.muted}">server.py</text><text x="480" y="69" font-size="10" fill="${T.muted}">exploit.c</text>
  <rect x="284" y="76" width="34" height="154" fill="${mix(T.bg, '#000000', 0.25)}"/>
  <rect x="318" y="170" width="398" height="14" fill="${T.primary}" opacity=".07"/>
  <g clip-path="url(#code)" transform="translate(0 80)">${scroll}</g>
  <rect x="334" y="170" width="7" height="12" fill="${T.accent}"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></rect>
  <rect x="284" y="214" width="432" height="16" fill="${T.primary}" opacity=".9"/>
  <text x="294" y="225" font-size="9" fill="${T.bg}" font-weight="700">NORMAL  ${esc(username || 'dev')}@devbox   UTF-8   Ln 42, Col 7</text>
  <!-- side monitor -->
  <rect x="846" y="214" width="12" height="46" fill="#0b0f14"/><rect x="816" y="254" width="72" height="8" rx="4" fill="#0b0f14" stroke="${T.border}"/>
  <rect x="760" y="80" width="184" height="138" rx="10" fill="#0b0f14" stroke="${T.secondary}" stroke-opacity=".5"/>
  <rect x="768" y="88" width="168" height="122" rx="3" fill="${mix(T.bg, '#000000', 0.5)}"/>
  <text x="776" y="102" font-size="9" fill="${T.muted}">net.monitor</text><circle cx="926" cy="98" r="3" fill="${T.accent}">${pulse('opacity', 1, 0.2, 1)}</circle>
  <g>${bars}</g>
  <line x1="772" x2="932" y1="206" y2="206" stroke="${T.border}"/>
  <!-- coffee -->
  <rect x="120" y="222" width="38" height="38" rx="7" fill="${T.panel}" stroke="${T.primary}" stroke-opacity=".6"/>
  <path d="M158 232 q16 0 16 12 t-16 12" fill="none" stroke="${T.primary}" stroke-opacity=".6" stroke-width="3"/>
  <rect x="124" y="226" width="30" height="5" rx="2" fill="${mix(T.bg, T.accent, 0.35)}"/>
  <g fill="none" stroke="${T.fg}" stroke-width="2" stroke-linecap="round" opacity="0">
    <path d="M130 214 q-6 -8 0 -16 t0 -16"><animate attributeName="opacity" values="0;.5;0" dur="3s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -8" dur="3s" repeatCount="indefinite"/></path>
    <path d="M140 214 q-6 -8 0 -16 t0 -16"><animate attributeName="opacity" values="0;.5;0" dur="3s" begin="-1s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -8" dur="3s" begin="-1s" repeatCount="indefinite"/></path>
    <path d="M150 214 q-6 -8 0 -16 t0 -16"><animate attributeName="opacity" values="0;.5;0" dur="3s" begin="-2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -8" dur="3s" begin="-2s" repeatCount="indefinite"/></path>
  </g>
  <!-- keyboard + mouse -->
  <rect x="338" y="296" width="326" height="36" rx="5" fill="#0b0f14" stroke="${T.border}"/>
  ${keys}
  <ellipse cx="716" cy="312" rx="11" ry="15" fill="#0b0f14" stroke="${T.border}"/><line x1="716" x2="716" y1="297" y2="308" stroke="${T.border}"/>
</g>
<text x="${W - 16}" y="${H - 10}" text-anchor="end" font-size="9" fill="${T.fg}" opacity=".25">while(alive) { eat(); sleep(); code(); }</text>
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="none" stroke="${T.primary}" stroke-opacity=".3"/>`;
  return doc(W, H, body, defs);
}

/* ---------------------------------------------------------- SECTION HEADER */
function header({ num, label, theme: T }) {
  const W = 1000, H = 64;
  const body = `
<defs><linearGradient id="ln" x1="0" x2="1"><stop offset="0" stop-color="${T.primary}"/><stop offset="1" stop-color="${T.primary}" stop-opacity="0"/></linearGradient></defs>
<g font-family="${FONT}">
<text x="6" y="40" font-size="16" fill="${T.secondary}">[${esc(num)}]</text>
<text x="62" y="42" font-size="26" font-weight="700" letter-spacing="3" fill="${T.fg}" filter="url(#glow)">${esc(label.toUpperCase())}</text>
<rect x="62" y="52" height="2" width="0" fill="url(#ln)"><animate attributeName="width" values="0;930;930;0" keyTimes="0;.22;.9;1" dur="6s" repeatCount="indefinite"/></rect>
<rect x="62" y="52" height="2" width="40" fill="${T.primary}" filter="url(#glow)"/>
</g>`;
  return doc(W, H, body);
}

/* ---------------------------------------------------------------- NOW CARD */
function nowCard({ cols, theme: T }) {
  const W = 1000, gap = 20;
  const n = cols.length;
  const cw = (W - gap * (n - 1)) / n;
  const maxItems = Math.max(...cols.map((c) => Math.min(c.items.length, 5)));
  const H = 70 + maxItems * 28;
  let body = `<g font-family="${FONT}">`;
  cols.forEach((c, i) => {
    const x = i * (cw + gap);
    body += `<rect x="${x}" y="0" width="${cw}" height="${H - 4}" rx="12" fill="${T.panel}" stroke="${T.border}"/>
<rect x="${x}" y="0" width="${cw}" height="3" rx="1.5" fill="${i % 2 ? T.secondary : T.primary}">${pulse('opacity', 0.5, 1, 2.5, i * 0.4)}</rect>
<text x="${x + 20}" y="34" font-size="14" font-weight="700" letter-spacing="2" fill="${i % 2 ? T.secondary : T.primary}">${esc(c.title.toUpperCase())}</text>`;
    c.items.slice(0, 5).forEach((it, j) => {
      const maxc = Math.floor((cw - 56) / 8.4);
      const t = it.length > maxc ? it.slice(0, maxc - 1) + '…' : it;
      body += `<circle cx="${x + 26}" cy="${64 + j * 28}" r="4" fill="${T.accent}">${pulse('opacity', 1, 0.25, 1.6, j * 0.3)}</circle>
<text x="${x + 42}" y="${69 + j * 28}" font-size="14" fill="${T.fg}">${esc(t)}</text>`;
    });
  });
  return doc(W, H, body + '</g>');
}

/* ------------------------------------------------------------------ FOOTER */
function footer({ creator, theme: T }) {
  const W = 1000, H = 190;
  const wave = (y, amp, color, op, dur, begin) => {
    let d = `M0,${y}`;
    d += ` Q125,${y - amp} 250,${y}`;
    for (let x = 500; x <= 2000; x += 250) d += ` T${x},${y}`;
    d += ` L2000,${H} L0,${H} Z`;
    return `<path d="${d}" fill="${color}" opacity="${op}"><animateTransform attributeName="transform" type="translate" values="0 0;-500 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></path>`;
  };
  const defs = `<linearGradient id="gb" x1="0" x2="1"><stop offset="0" stop-color="${T.secondary}"/><stop offset=".5" stop-color="${T.primary}"/><stop offset="1" stop-color="${T.accent}"/></linearGradient>
<clipPath id="cp"><rect width="${W}" height="${H}" rx="14"/></clipPath>`;
  const body = `<g clip-path="url(#cp)" font-family="${FONT}">
<rect width="${W}" height="${H}" fill="${T.bg}"/>
${wave(70, 26, T.primary, 0.14, 9, 0)}${wave(86, 22, T.secondary, 0.16, 6.5, -2)}${wave(104, 18, T.primary, 0.22, 5, -1)}
<rect x="250" y="112" width="500" height="54" rx="27" fill="${T.panel}" stroke="url(#gb)" stroke-width="1.6"/>
<rect x="250" y="112" width="500" height="54" rx="27" fill="none" stroke="${T.primary}" stroke-opacity=".5" stroke-width="5" opacity=".35" filter="url(#glow)">${pulse('opacity', 0.15, 0.5, 3)}</rect>
<text x="500" y="135" text-anchor="middle" font-size="12" fill="${T.muted}" letter-spacing="2">PROFILE TEMPLATE  //  DEVVERSE</text>
<text x="500" y="155" text-anchor="middle" font-size="16" font-weight="700" fill="${T.fg}">&lt;/&gt; crafted by <tspan fill="${T.primary}">@${esc(creator.github)}</tspan></text>
</g>`;
  return doc(W, H, body, defs);
}

module.exports = { banner, typing, terminal, setupScene, header, nowCard, footer, esc, rng };
