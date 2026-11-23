#!/usr/bin/env node
// Validates index.json against DSH Format 1 (@deepseek-ai/dsh-plugin-market-index) rules.
import { readFileSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = resolve(root, 'index.json');
const errors = [];

const fail = (msg) => errors.push(msg);

function parseSemver(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(String(v || ''));
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), pre: m[4] || '' };
}

function cmpSemver(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  if (!a.pre && b.pre) return 1;
  if (a.pre && !b.pre) return -1;
  return a.pre.localeCompare(b.pre);
}

function checkLocalizedText(obj, field) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || Object.keys(obj).length === 0) {
    fail(`${field} must be a non-empty LocalizedText object`);
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v !== 'string' || !v.trim()) fail(`${field}.${k} must be a non-empty string`);
  }
}

let data;
try {
  data = JSON.parse(readFileSync(indexPath, 'utf8'));
} catch (err) {
  console.error('Failed to parse index.json:', err.message);
  process.exit(1);
}

if (data.format !== 1) fail('root.format must be literal 1');
checkLocalizedText(data.title, 'root.title');
if (data.description !== undefined) checkLocalizedText(data.description, 'root.description');
if (!data.metadata || typeof data.metadata !== 'object') fail('root.metadata is required');

const categories = new Set(Object.keys(data.metadata?.categories || {}));
const labels = new Set(Object.keys(data.metadata?.labels || {}));
const sortKeys = new Set(Object.keys(data.metadata?.sortKeys || {}));

if (!Array.isArray(data.plugins) || data.plugins.length === 0) {
  fail('root.plugins must be a non-empty array');
}

const seenNames = new Set();
for (const [i, p] of (data.plugins || []).entries()) {
  const ctx = `plugins[${i}] (${p?.name || 'unnamed'})`;
  if (!p || typeof p !== 'object') {
    fail(`${ctx} must be an object`);
    continue;
  }
  if (typeof p.name !== 'string' || !p.name.trim()) {
    fail(`${ctx}.name is required`);
  } else if (seenNames.has(p.name)) {
    fail(`${ctx}.name is duplicated`);
  } else {
    seenNames.add(p.name);
  }
  if (p.title) checkLocalizedText(p.title, `${ctx}.title`);
  if (p.description) checkLocalizedText(p.description, `${ctx}.description`);
  if (p.icon) {
    if (p.icon.startsWith('./') || p.icon.startsWith('../')) {
      const iconFile = resolve(root, p.icon);
      if (!existsSync(iconFile)) fail(`${ctx}.icon file not found: ${p.icon}`);
      else if (statSync(iconFile).size > 32 * 1024) fail(`${ctx}.icon exceeds 32 KiB limit: ${p.icon}`);
    } else if (!/^https?:\/\/|^data:/.test(p.icon)) {
      fail(`${ctx}.icon must be a relative path, http(s) URL, or data URL`);
    }
  }
  for (const cat of p.metadata?.categories || []) {
    if (!categories.has(cat)) fail(`${ctx}.metadata.categories references unknown category "${cat}"`);
  }
  for (const lbl of p.metadata?.labels || []) {
    if (!labels.has(lbl)) fail(`${ctx}.metadata.labels references unknown label "${lbl}"`);
  }
  for (const sk of Object.keys(p.metadata?.sortKeys || {})) {
    if (!sortKeys.has(sk)) fail(`${ctx}.metadata.sortKeys references unknown sortKey "${sk}"`);
  }
  if (!Array.isArray(p.versions) || p.versions.length === 0) {
    fail(`${ctx}.versions must be a non-empty array`);
    continue;
  }
  let prev = null;
  for (const [j, v] of p.versions.entries()) {
    const vctx = `${ctx}.versions[${j}]`;
    const parsed = parseSemver(v.version);
    if (!parsed) fail(`${vctx}.version is not valid SemVer: ${v.version}`);
    if (prev && parsed && cmpSemver(prev, parsed) <= 0) {
      fail(`${vctx}.version (${v.version}) must be strictly descending SemVer`);
    }
    prev = parsed;
    if (typeof v.publishTimestamp !== 'number' || v.publishTimestamp <= 0) {
      fail(`${vctx}.publishTimestamp must be a positive Unix timestamp (seconds)`);
    }
    if (!v.source || typeof v.source !== 'object') {
      fail(`${vctx}.source is required`);
    } else if (v.source.type === 'git') {
      if (typeof v.source.url !== 'string' || !/^https:\/\/.+/.test(v.source.url)) {
        fail(`${vctx}.source.url must be an https:// git URL`);
      }
      if (typeof v.source.commit !== 'string' || !/^[0-9a-f]{7,40}$/i.test(v.source.commit)) {
        fail(`${vctx}.source.commit must be a pinned git commit hash`);
      }
    } else if (v.source.type === 'npm') {
      if (v.source.registry && !/^https?:\/\/.+/.test(v.source.registry)) {
        fail(`${vctx}.source.registry must be a valid URL`);
      }
    } else {
      fail(`${vctx}.source.type must be "git" or "npm"`);
    }
  }
}

if (errors.length) {
  console.error('index.json validation FAILED:');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}
console.log(`OK: index.json is valid DSH Format 1 (${data.plugins.length} plugins).`);
