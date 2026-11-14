'use strict';

const THEMES = {
  matrix: {
    label: 'Matrix Green',
    bg: '#020b05', bg2: '#04170b', panel: '#051a0d', border: '#11422a',
    fg: '#d2ffe0', muted: '#5fa57a',
    primary: '#00ff41', secondary: '#19d3a2', accent: '#b6ff6a',
  },
  cyberpunk: {
    label: 'Cyberpunk Neon',
    bg: '#0a0614', bg2: '#150a2a', panel: '#120a22', border: '#3a1d6e',
    fg: '#ececff', muted: '#8a7fb8',
    primary: '#00f0ff', secondary: '#ff2a6d', accent: '#fcee0a',
  },
  dracula: {
    label: 'Dracula',
    bg: '#1b1c26', bg2: '#242636', panel: '#282a36', border: '#44475a',
    fg: '#f8f8f2', muted: '#7b86b8',
    primary: '#bd93f9', secondary: '#ff79c6', accent: '#50fa7b',
  },
  tokyo: {
    label: 'Tokyo Night',
    bg: '#12131c', bg2: '#1a1b26', panel: '#1a1b26', border: '#33385a',
    fg: '#c0caf5', muted: '#6b749f',
    primary: '#7aa2f7', secondary: '#bb9af7', accent: '#7dcfff',
  },
  ocean: {
    label: 'Deep Ocean',
    bg: '#03101c', bg2: '#062238', panel: '#071b2e', border: '#164a6e',
    fg: '#e0f4ff', muted: '#6fa3c4',
    primary: '#38bdf8', secondary: '#22d3ee', accent: '#a7f3d0',
  },
};

const hex = (c) => c.replace('#', '');

function mix(a, b, t) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const A = p(a);
  const B = p(b);
  const out = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
}

function resolveTheme(name) {
  const key = String(name || 'matrix').toLowerCase();
  const base = THEMES[key] || THEMES.matrix;
  const t = { key: THEMES[key] ? key : 'matrix', ...base };
  t.desk = mix(t.bg, t.fg, 0.07);
  t.dim = mix(t.bg, t.fg, 0.35);
  t.snakeDots = [mix(t.bg, t.primary, 0.12), mix(t.bg, t.primary, 0.35), mix(t.bg, t.primary, 0.55), mix(t.bg, t.primary, 0.78), t.primary];
  return t;
}

module.exports = { THEMES, resolveTheme, mix, hex };
