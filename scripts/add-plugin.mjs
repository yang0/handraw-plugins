#!/usr/bin/env node
// Helper CLI to add or update a plugin version in index.json from a local plugin folder.
// Usage:
//   node scripts/add-plugin.mjs --dir E:\projectHome\my-plugin --repo https://github.com/yang0/my-plugin.git [--subdir plugins/foo] [--category creation] [--official]
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = (k, def = '') => {
  const i = args.indexOf(k);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : def;
};
const has = (k) => args.includes(k);

const dir = flag('--dir');
if (!dir) {
  console.error('Usage: node scripts/add-plugin.mjs --dir <pluginDir> [--repo <https://...git>] [--commit <sha>] [--npm] [--subdir <rel>] [--category creation] [--official]');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8'));
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = resolve(root, 'index.json');
const index = JSON.parse(readFileSync(indexPath, 'utf8'));

let source;
if (has('--npm')) {
  source = { type: 'npm' };
} else {
  let repo = flag('--repo');
  if (!repo) {
    repo = execFileSync('git', ['-C', dir, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
    repo = repo.replace(/^git@github\.com:/, 'https://github.com/');
  }
  const commit = flag('--commit') || execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const subdir = flag('--subdir');
  source = { type: 'git', url: repo, commit, ...(subdir ? { directory: subdir } : {}) };
}

const versionEntry = {
  version: pkg.version || '0.1.0',
  publishTimestamp: Math.floor(Date.now() / 1000),
  source,
  engines: pkg.engines?.dsh ? { dsh: pkg.engines.dsh } : {},
};

const existing = index.plugins.find((p) => p.name === pkg.name);
if (existing) {
  existing.versions = [versionEntry, ...existing.versions.filter((v) => v.version !== versionEntry.version)];
  console.log(`Updated ${pkg.name} -> v${versionEntry.version}`);
} else {
  const cat = flag('--category', 'creation');
  const labels = ['handraw-verified', 'dsh-native'];
  if (has('--official')) labels.unshift('official');
  index.plugins.push({
    name: pkg.name,
    title: { zh: pkg.name, en: pkg.name },
    description: { zh: pkg.description || '', en: pkg.description || '' },
    author: typeof pkg.author === 'string' ? pkg.author : (pkg.author?.name || 'community'),
    homepage: pkg.homepage || source.url?.replace(/\.git$/, '') || '',
    ...(source.url ? { repository: { url: source.url.replace(/\.git$/, ''), ...(source.directory ? { directory: source.directory } : {}) } } : {}),
    metadata: { categories: [cat], labels, sortKeys: { featured: 50 } },
    versions: [versionEntry],
  });
  console.log(`Added ${pkg.name} v${versionEntry.version}`);
}

writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
