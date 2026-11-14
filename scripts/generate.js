#!/usr/bin/env node
'use strict';
/**
 * DevVerse generator:  config.yml  ->  assets/*.svg  +  README.md
 *   node scripts/generate.js                 build into this repo
 *   node scripts/generate.js --out <dir>     build into another folder (preview/testing)
 *   node scripts/generate.js --demo          regenerate docs/preview/* for the template landing page
 */
const fs = require('fs');
const path = require('path');
const { parse } = require('./yaml');
const { resolveTheme, THEMES, hex } = require('./themes');
const S = require('./svg');
const { jokeOfTheDay, wrap } = require('./jokes');
const { loadCreator } = require('./credit');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const argVal = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);

const DEFAULTS = {
  name: 'Your Name', github_username: 'yourusername', role: '', location: '', bio: [], theme: 'matrix',
  taglines: [], skills: [], learning: [], building: [], exploring: [], cyber_focus: [], projects: [], socials: {},
  features: {
    banner: true, typing: true, socials: true, visitors: true, terminal: true, setup_scene: true, skills: true,
    now: true, cyber: true, projects: true, stats: true, streak: true, languages: true, activity_graph: true,
    snake: true, contrib_3d: true, joke: true,
  },
};

const arr = (v) => (Array.isArray(v) ? v.filter((x) => x !== '' && x != null).map(String) : v ? [String(v)] : []);

function loadConfig(file) {
  const raw = parse(fs.readFileSync(file, 'utf8'));
  const cfg = { ...DEFAULTS, ...raw, features: { ...DEFAULTS.features, ...(raw.features || {}) }, socials: raw.socials || {} };
  for (const k of ['bio', 'taglines', 'skills', 'learning', 'building', 'exploring', 'cyber_focus', 'projects']) cfg[k] = arr(cfg[k]);
  cfg.name = String(cfg.name || 'Your Name');
  cfg.github_username = String(cfg.github_username || '').replace(/^@/, '').trim();
  return cfg;
}

const ALIAS = {
  python: 'py', 'c++': 'cpp', csharp: 'cs', 'c#': 'cs', javascript: 'js', typescript: 'ts', node: 'nodejs', golang: 'go',
  postgres: 'postgres', postgresql: 'postgres', vs: 'vscode', 'vs-code': 'vscode', shell: 'bash', kali: 'kali',
};

const SOCIALS = {
  linkedin: { label: 'LinkedIn', logo: 'linkedin', url: (v) => `https://linkedin.com/in/${v}` },
  twitter: { label: 'X', logo: 'x', url: (v) => `https://x.com/${v}` },
  facebook: { label: 'Facebook', logo: 'facebook', url: (v) => `https://facebook.com/${v}` },
  instagram: { label: 'Instagram', logo: 'instagram', url: (v) => `https://instagram.com/${v}` },
  youtube: { label: 'YouTube', logo: 'youtube', url: (v) => `https://youtube.com/@${v}` },
  discord: { label: 'Discord', logo: 'discord', url: (v) => `https://discord.com/users/${v}` },
  telegram: { label: 'Telegram', logo: 'telegram', url: (v) => `https://t.me/${v}` },
  medium: { label: 'Medium', logo: 'medium', url: (v) => `https://medium.com/@${v}` },
  devto: { label: 'DEV', logo: 'devdotto', url: (v) => `https://dev.to/${v}` },
  leetcode: { label: 'LeetCode', logo: 'leetcode', url: (v) => `https://leetcode.com/${v}` },
  codeforces: { label: 'Codeforces', logo: 'codeforces', url: (v) => `https://codeforces.com/profile/${v}` },
  tryhackme: { label: 'TryHackMe', logo: 'tryhackme', url: (v) => `https://tryhackme.com/p/${v}` },
  hackthebox: { label: 'HackTheBox', logo: 'hackthebox', url: (v) => `https://app.hackthebox.com/users/${v}` },
  portfolio: { label: 'Portfolio', logo: 'googlechrome', url: (v) => v },
  email: { label: 'Email', logo: 'gmail', url: (v) => `mailto:${v}` },
};

const q = (s) => encodeURIComponent(s);
const bdg = (label, bg, logo, logoColor) =>
  `https://img.shields.io/badge/${q(label.replace(/-/g, '--'))}-${hex(bg)}?style=for-the-badge&logo=${logo}&logoColor=${hex(logoColor)}`;

function cmd(text) { return { k: 'cmd', segs: [['$ ', 'primary'], [text, 'fg']] }; }
function out(...segs) { return { k: 'out', segs: segs.map((s) => (typeof s === 'string' ? [s, 'muted'] : s)) }; }

/** build every asset + README. returns { assets: {file: svg}, readme } */
function build(cfg, creator, today = new Date()) {
  const T = resolveTheme(cfg.theme);
  const u = cfg.github_username;
  const F = cfg.features;
  const assets = {};
  const first = cfg.name.split(' ')[0];

  if (F.banner) assets['banner.svg'] = S.banner({ name: cfg.name, role: cfg.role, username: u, location: cfg.location, theme: T, creator });
  if (F.typing) assets['typing.svg'] = S.typing({ lines: [`Hi there, I'm ${first}`, ...cfg.taglines].slice(0, 8), theme: T });

  if (F.terminal) {
    const L = [cmd('whoami'), out([cfg.name, 'fg'], [cfg.role ? `  ·  ${cfg.role}` : '', 'secondary'])];
    if (cfg.bio.length) { L.push(cmd('cat about.txt')); cfg.bio.slice(0, 3).forEach((b) => L.push(out([b, 'fg']))); }
    if (cfg.location) L.push(cmd('echo $LOCATION'), out([cfg.location, 'accent']));
    if (cfg.skills.length) L.push(cmd('cat skills.txt'), out([cfg.skills.join('  ·  '), 'accent']));
    if (cfg.projects.length) L.push(cmd('ls projects/'), out([cfg.projects.map((p) => p + '/').join('   '), 'secondary']));
    L.push(cmd('echo $STATUS'), out(['● ', 'accent'], ['Open to collaborate & learn', 'fg']));
    assets['terminal.svg'] = S.terminal({ title: `${u || 'dev'}@devverse: ~`, lines: L, theme: T, seed: 5 });
  }

  if (F.setup_scene) assets['setup.svg'] = S.setupScene({ theme: T, username: u });

  const cols = [];
  if (cfg.learning.length) cols.push({ title: 'Learning', items: cfg.learning });
  if (cfg.building.length) cols.push({ title: 'Building', items: cfg.building });
  if (cfg.exploring.length) cols.push({ title: 'Exploring', items: cfg.exploring });
  if (F.now && cols.length) assets['now.svg'] = S.nowCard({ cols, theme: T });

  if (F.cyber) {
    const focus = cfg.cyber_focus.length ? cfg.cyber_focus.join(' · ') : 'Network Security · CTF';
    const L = [
      cmd('sudo ./init_cyber_lab.sh'),
      out(['[*] ', 'secondary'], ['Initializing secure environment ...', 'fg']),
      out(['[+] ', 'primary'], ['Firewall rules loaded ............. ', 'muted'], ['OK', 'accent']),
      out(['[+] ', 'primary'], ['Encryption layer (AES-256) ........ ', 'muted'], ['ENABLED', 'accent']),
      out(['[+] ', 'primary'], ['Intrusion detection .............. ', 'muted'], ['ACTIVE', 'accent']),
      out(['[>] ', 'secondary'], ['Focus: ', 'muted'], [focus, 'fg']),
      cmd('echo "stay curious. stay ethical."'),
      out(['stay curious. stay ethical.', 'accent']),
    ];
    assets['cyber.svg'] = S.terminal({ title: 'root@cyber-lab: ~/ethical-hacking', lines: L, theme: T, rain: true, seed: 21 });
  }

  if (F.joke) {
    const lines = wrap(jokeOfTheDay(today), 84);
    const L = [cmd('cat dev_joke_of_the_day.txt'), ...lines.map((l) => out([l, 'fg']))];
    assets['joke.svg'] = S.terminal({ title: 'joke.txt', lines: L, theme: T, seed: 9 });
  }

  assets['footer.svg'] = S.footer({ creator, theme: T }); // credit is ALWAYS generated

  // ---------- README ----------
  const sections = [];
  const hdr = (id, label) => {
    const n = String(sections.length + 1).padStart(2, '0');
    assets[`h-${id}.svg`] = S.header({ num: n, label, theme: T });
    sections.push(id);
    return `<img src="assets/h-${id}.svg" width="100%" alt="${label}"/>`;
  };
  const colors = {
    bg: hex(T.panel), title: hex(T.primary), text: hex(T.fg), icon: hex(T.secondary), border: hex(T.border),
  };
  const statQs = `show_icons=true&bg_color=${colors.bg}&title_color=${colors.title}&text_color=${colors.text}&icon_color=${colors.icon}&border_color=${colors.border}&hide_border=false`;
  const R = [];
  R.push(`<!-- Generated by DevVerse (https://github.com/${creator.repo}) -- do not edit this file, edit config.yml -->`);
  R.push('<div align="center">\n');
  if (F.banner) R.push(`<img src="assets/banner.svg" width="100%" alt="${S.esc(cfg.name)}"/>\n`);
  if (F.typing) R.push(`<img src="assets/typing.svg" width="100%" alt="typing intro"/>\n`);

  if (F.socials) {
    const badges = [];
    for (const [key, def] of Object.entries(SOCIALS)) {
      let v = cfg.socials[key];
      if (!v) continue;
      v = String(v).replace(/^@/, '');
      const url = /^(https?:|mailto:)/.test(v) ? v : def.url(v);
      badges.push(`<a href="${url}"><img src="${bdg(def.label, `#${hex(T.panel)}`, def.logo, T.primary)}" alt="${def.label}"/></a>`);
    }
    if (badges.length) R.push(badges.join('\n') + '\n');
  }
  if (F.visitors && u) {
    R.push(`<img src="https://komarev.com/ghpvc/?username=${q(u)}&label=PROFILE+VIEWS&color=${hex(T.primary)}&labelColor=${hex(T.panel)}&style=for-the-badge" alt="profile views"/>\n`);
  }
  R.push('</div>\n');

  if (F.terminal || F.setup_scene) {
    R.push(`<div align="center">\n${hdr('whoami', 'whoami')}\n`);
    if (F.terminal) R.push(`<img src="assets/terminal.svg" width="100%" alt="terminal"/>\n`);
    if (F.setup_scene) R.push(`<img src="assets/setup.svg" width="100%" alt="coding setup"/>\n`);
    R.push('</div>\n');
  }
  if (F.skills && cfg.skills.length) {
    const ids = cfg.skills.map((s) => ALIAS[s.toLowerCase()] || s.toLowerCase()).join(',');
    R.push(`<div align="center">\n${hdr('stack', 'tech stack')}\n<img src="https://skillicons.dev/icons?i=${ids}&perline=${Math.min(cfg.skills.length, 9)}&theme=dark" alt="skills"/>\n</div>\n`);
  }
  if (assets['now.svg']) R.push(`<div align="center">\n${hdr('now', 'currently')}\n<img src="assets/now.svg" width="100%" alt="learning building exploring"/>\n</div>\n`);
  if (F.cyber) R.push(`<div align="center">\n${hdr('cyber', 'cyber lab')}\n<img src="assets/cyber.svg" width="100%" alt="cyber lab"/>\n</div>\n`);
  if (F.projects && cfg.projects.length && u) {
    const cards = cfg.projects.slice(0, 6).map((p) => `<a href="https://github.com/${u}/${p}"><img src="https://github-readme-stats.vercel.app/api/pin/?username=${q(u)}&repo=${q(p)}&${statQs}" alt="${S.esc(p)}"/></a>`);
    R.push(`<div align="center">\n${hdr('projects', 'projects')}\n${cards.join('\n')}\n</div>\n`);
  }
  if (u && (F.stats || F.streak || F.languages || F.activity_graph)) {
    const parts = [];
    if (F.stats) parts.push(`<img height="180" src="https://github-readme-stats.vercel.app/api?username=${q(u)}&rank_icon=github&${statQs}" alt="stats"/>`);
    if (F.languages) parts.push(`<img height="180" src="https://github-readme-stats.vercel.app/api/top-langs/?username=${q(u)}&layout=compact&${statQs}" alt="top languages"/>`);
    let block = `<div align="center">\n${hdr('stats', 'github stats')}\n${parts.join('\n')}\n`;
    if (F.streak) block += `<br/>\n<img src="https://streak-stats.demolab.com?user=${q(u)}&background=${colors.bg}&ring=${colors.title}&fire=${hex(T.secondary)}&currStreakNum=${colors.text}&sideNums=${colors.text}&currStreakLabel=${colors.title}&sideLabels=${colors.icon}&dates=${hex(T.muted)}&stroke=${colors.border}&border=${colors.border}" alt="streak"/>\n`;
    if (F.activity_graph) block += `<br/>\n<img width="100%" src="https://github-readme-activity-graph.vercel.app/graph?username=${q(u)}&bg_color=${colors.bg}&color=${colors.text}&line=${colors.title}&point=${hex(T.accent)}&area=true&area_color=${colors.title}&hide_border=true&title_color=${colors.title}" alt="activity graph"/>\n`;
    R.push(block + '</div>\n');
  }
  if (u && (F.snake || F.contrib_3d)) {
    let block = `<div align="center">\n${hdr('activity', 'contribution world')}\n`;
    if (F.contrib_3d) block += `<img width="100%" src="profile-3d-contrib/profile-night-rainbow.svg" alt="3D contribution graph"/>\n`;
    if (F.snake) block += `<img width="100%" src="https://raw.githubusercontent.com/${u}/${u}/output/github-snake-dark.svg" alt="snake"/>\n`;
    R.push(block + '</div>\n');
  }
  if (F.joke) R.push(`<div align="center">\n<img src="assets/joke.svg" width="100%" alt="dev joke of the day"/>\n</div>\n`);

  // ---- credit + star/follow request (always generated) ----
  R.push(`<div align="center">\n
<img src="assets/footer.svg" width="100%" alt="DevVerse profile template by @${creator.github}"/>

<a href="https://github.com/${creator.repo}"><img src="https://img.shields.io/github/stars/${creator.repo}?style=for-the-badge&logo=github&label=%E2%AD%90%20STAR%20THE%20TEMPLATE&color=${hex(T.primary)}&labelColor=${hex(T.panel)}&logoColor=${hex(T.primary)}" alt="Star the template"/></a>
<a href="https://github.com/${creator.github}"><img src="https://img.shields.io/github/followers/${creator.github}?style=for-the-badge&logo=github&label=FOLLOW%20%40${q(creator.github)}&color=${hex(T.secondary)}&labelColor=${hex(T.panel)}&logoColor=${hex(T.secondary)}" alt="Follow ${creator.github}"/></a>
<a href="https://github.com/${creator.repo}/generate"><img src="https://img.shields.io/badge/GET%20THIS%20PROFILE-USE%20TEMPLATE-${hex(T.accent)}?style=for-the-badge&logo=rocket&labelColor=${hex(T.panel)}&logoColor=${hex(T.accent)}" alt="Use this template"/></a>

<sub>Like this profile? ⭐ <b>star the template</b> and 👤 <b>follow <a href="https://github.com/${creator.github}">@${creator.github}</a></b> to support the creator.</sub>

</div>
`);
  return { assets, readme: R.join('\n') };
}

function write(dir, files) {
  for (const [f, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.writeFileSync(path.join(dir, f), content);
  }
}

async function main() {
  const creator = await loadCreator(ROOT);
  if (creator.github === 'YOUR_USERNAME') console.warn('[devverse] creator.json is not branded yet (template owner: run scripts/brand.js).');

  if (argv.includes('--demo')) {
    const demo = loadConfig(path.join(ROOT, 'config.yml'));
    Object.assign(demo, {
      name: 'Alex Carter', github_username: 'alexcarter', role: 'CSE Student | Cyber Security Learner', projects: ['portfolio', 'ctf-writeups'],
    });
    for (const key of Object.keys(THEMES)) {
      const { assets } = build({ ...demo, theme: key }, creator);
      const pick = {};
      for (const f of ['banner.svg', 'terminal.svg', 'setup.svg', 'cyber.svg']) pick[`docs/preview/${key}-${f}`] = assets[f];
      write(ROOT, pick);
    }
    console.log(`[devverse] demo previews written for: ${Object.keys(THEMES).join(', ')}`);
    return;
  }

  const cfg = loadConfig(path.join(ROOT, 'config.yml'));
  const outDir = argVal('--out') ? path.resolve(argVal('--out')) : ROOT;
  if (cfg.github_username === 'yourusername' && !argv.includes('--force')) {
    console.log('[devverse] Setup mode: edit config.yml and set your github_username to switch the generator on. (Nothing was changed.)');
    return;
  }
  if (!THEMES[String(cfg.theme).toLowerCase()]) console.warn(`[devverse] Unknown theme "${cfg.theme}", using matrix. Options: ${Object.keys(THEMES).join(', ')}`);
  const { assets, readme } = build(cfg, creator);
  const files = { 'README.md': readme };
  for (const [f, svg] of Object.entries(assets)) files[`assets/${f}`] = svg;
  write(outDir, files);
  console.log(`[devverse] built ${Object.keys(assets).length} assets + README.md for @${cfg.github_username} (theme: ${cfg.theme}) -> ${outDir}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('[devverse] ERROR:', e.message);
    process.exit(1);
  });
}

module.exports = { build, loadConfig };
