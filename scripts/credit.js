'use strict';
/**
 * Creator credit.
 * - CANONICAL_REPO is the template's home. On every build the generator tries to fetch
 *   creator.json from that repo, so editing your local creator.json does not remove the credit.
 * - Credit is baked into generated SVGs (banner watermark + footer) and into the README footer.
 *
 * Run `node scripts/brand.js --github <you> --name "<Your Name>"` ONCE (template owner only).
 */
const fs = require('fs');
const path = require('path');

const CANONICAL_REPO = 'YOUR_USERNAME/devverse-profile'; // <- set by scripts/brand.js

function valid(c) {
  return c && typeof c.github === 'string' && /^[A-Za-z0-9-]{1,39}$/.test(c.github) && typeof c.name === 'string';
}

async function loadCreator(root) {
  const local = JSON.parse(fs.readFileSync(path.join(root, 'creator.json'), 'utf8'));
  local.repo = CANONICAL_REPO;
  if (!CANONICAL_REPO.includes('YOUR_USERNAME') && !process.env.DEVVERSE_OFFLINE) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(`https://raw.githubusercontent.com/${CANONICAL_REPO}/main/creator.json`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        const remote = await res.json();
        if (valid(remote)) return { ...remote, repo: CANONICAL_REPO };
      }
    } catch (_) {
      /* offline: fall back to local copy */
    }
  }
  return local;
}

module.exports = { loadCreator, CANONICAL_REPO };
