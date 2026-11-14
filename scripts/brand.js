#!/usr/bin/env node
'use strict';
/**
 * TEMPLATE OWNER ONLY - run once before publishing your template:
 *   node scripts/brand.js --github your-username --name "Your Name" [--repo devverse-profile]
 * Replaces YOUR_USERNAME / YOUR_NAME placeholders everywhere, then rebuilds the demo previews.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const a = process.argv.slice(2);
const val = (k) => (a.includes(k) ? a[a.indexOf(k) + 1] : null);
const github = val('--github');
const name = val('--name');
if (!github || !name || !/^[A-Za-z0-9-]{1,39}$/.test(github)) {
  console.error('Usage: node scripts/brand.js --github <username> --name "<Your Name>" [--repo <template-repo-name>]');
  process.exit(1);
}
const repoName = val('--repo') || 'devverse-profile';
const files = ['creator.json', 'README.md', 'SETUP.md', 'LICENSE', 'scripts/credit.js', 'package.json', 'docs/LAUNCH.md'];
for (const f of files) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/YOUR_USERNAME\/devverse-profile/g, `${github}/${repoName}`).replace(/YOUR_USERNAME/g, github).replace(/YOUR_NAME/g, name);
  fs.writeFileSync(p, s);
}
console.log(`Branded as ${name} (@${github}), template repo: ${github}/${repoName}`);
try {
  execFileSync(process.execPath, [path.join(__dirname, 'generate.js'), '--demo'], { stdio: 'inherit', env: { ...process.env, DEVVERSE_OFFLINE: '1' } });
} catch (_) {}
console.log('Done. Commit & push, then tick "Template repository" in your repo settings.');
