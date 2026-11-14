'use strict';
/**
 * Tiny zero-dependency YAML subset parser (enough for config.yml).
 * Supports: comments, key: value, nested maps, "- item" lists, [a, b] inline lists,
 * quoted strings, booleans (true/false), numbers, null.
 * Tip: wrap any text containing ':' or '#' in "double quotes".
 */

function stripComment(s) {
  let q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === q && s[i - 1] !== '\\') q = null;
    } else if ((c === '"' || c === "'") && (i === 0 || /[\s\[,:]/.test(s[i - 1]))) {
      q = c;
    } else if (c === '#' && (i === 0 || /\s/.test(s[i - 1]))) {
      return s.slice(0, i).trimEnd();
    }
  }
  return s;
}

function splitTop(s) {
  const out = [];
  let cur = '';
  let q = null;
  for (const c of s) {
    if (q) {
      cur += c;
      if (c === q) q = null;
    } else if (c === '"' || c === "'") {
      q = c;
      cur += c;
    } else if (c === ',') {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  if (cur.trim() !== '') out.push(cur);
  return out;
}

function scalar(v) {
  v = v.trim();
  if (v === '') return '';
  if (v[0] === '[' && v.endsWith(']')) return splitTop(v.slice(1, -1)).map(scalar);
  if ((v[0] === '"' && v.endsWith('"') && v.length > 1) || (v[0] === "'" && v.endsWith("'") && v.length > 1)) {
    return v.slice(1, -1).replace(/\\"/g, '"');
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

function parse(src) {
  const L = [];
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.replace(/\t/g, '  ');
    const t = stripComment(line.trim());
    if (!t) continue;
    L.push({ ind: line.match(/^ */)[0].length, t });
  }
  let i = 0;
  const isItem = (t) => t === '-' || t.startsWith('- ');

  function block(ind) {
    if (isItem(L[i].t)) {
      const arr = [];
      while (i < L.length && L[i].ind === ind && isItem(L[i].t)) {
        arr.push(scalar(L[i].t.slice(1)));
        i++;
      }
      return arr;
    }
    const obj = {};
    while (i < L.length && L[i].ind === ind && !isItem(L[i].t)) {
      const t = L[i].t;
      const m = t.match(/^("[^"]+"|'[^']+'|[^:]+?)\s*:(?:\s+(.*))?$/);
      if (!m) throw new Error(`config.yml: cannot understand this line: "${t}"`);
      const key = m[1].replace(/^["']|["']$/g, '');
      const rest = m[2];
      i++;
      if (rest === undefined || rest === '') {
        if (i < L.length && L[i].ind > ind) obj[key] = block(L[i].ind);
        else if (i < L.length && L[i].ind === ind && isItem(L[i].t)) obj[key] = block(ind);
        else obj[key] = '';
      } else {
        obj[key] = scalar(rest);
      }
    }
    return obj;
  }

  if (!L.length) return {};
  const result = block(L[0].ind);
  if (i < L.length) throw new Error(`config.yml: check the indentation near: "${L[i].t}"`);
  return result;
}

module.exports = { parse };
