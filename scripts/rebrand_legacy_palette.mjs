import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = '/home/ubuntu/gorilla-gear-nutrition/client/src';
const replacements = new Map([
  ['#0EA5E9', '#a8751c'],
  ['#0284C7', '#7c5a20'],
  ['#E11D48', '#a8751c'],
  ['#BE123C', '#7c5a20'],
  ['#DC2626', '#7c5a20'],
  ['#38BDF8', '#f0c65e'],
  ['#7DD3FC', '#e7c979'],
  ['#BAE6FD', '#f6e4af'],
  ['#FDA4AF', '#e7c979'],
  ['#1E293B', '#454545'],
  ['#94A3B8', '#c9c2b6'],
  ['#64748B', '#9b9388'],
  ['#475569', '#6b665e'],
  ['#334155', '#5c5852'],
  ['#080B10', '#090909'],
  ['#0B0B0B', '#101010'],
  ['#0A0A0A', '#101010'],
  ['#111827', '#161616'],
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    if (entry.isFile() && /\.(tsx|ts|css)$/.test(entry.name) && !entry.name.includes('.test.')) files.push(fullPath);
  }
  return files;
}

const changed = [];
for (const file of await walk(root)) {
  const before = await readFile(file, 'utf8');
  let after = before;
  for (const [legacy, brand] of replacements) after = after.replaceAll(legacy, brand);
  if (after !== before) {
    await writeFile(file, after);
    changed.push(path.relative(root, file));
  }
}

console.log(JSON.stringify({ changedFiles: changed.length, files: changed }, null, 2));
