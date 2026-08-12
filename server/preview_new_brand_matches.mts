import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import fs from 'node:fs';
import path from 'node:path';

const work = '/home/ubuntu/ggn-image-import-20260812';
const groups = [
  { key: 'Noventra', dir: path.join(work, 'Noventra'), brandLabel: 'Noventra', productPrefix: null },
  { key: 'IPharma', dir: path.join(work, 'IPharma'), brandLabel: 'Ipharma', productPrefix: 'ipharma' },
  { key: 'Pharmacom', dir: path.join(work, 'Pharmacom'), brandLabel: 'Pharmacom', productPrefix: 'pc' },
  { key: 'NOVA', dir: path.join(work, 'NOVA'), brandLabel: 'NOVA', productPrefix: 'nova' },
];

function normalize(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}
function filesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(full));
    else if (/\.(png|jpg|jpeg|webp|jfif|avif)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const products = await db.select().from(schema.products);
  for (const group of groups) {
    const scoped = group.productPrefix
      ? products.filter((p) => normalize(p.name).startsWith(normalize(group.productPrefix + ' -')))
      : products;
    console.log(`\\n=== ${group.key}: ${filesUnder(group.dir).length} images; ${scoped.length} scoped products ===`);
    for (const file of filesUnder(group.dir).sort()) {
      const base = path.basename(file, path.extname(file));
      const needle = normalize(base);
      const matches = scoped.filter((p) => {
        const productText = normalize(p.name);
        return productText.includes(needle) || needle.includes(normalize(p.name.replace(/^[^-]+-/, '')));
      });
      console.log(`${group.key} | ${path.basename(file)} | ${matches.length ? matches.map((p) => `${p.id}:${p.name}`).join(' || ') : 'NO MATCH'}`);
    }
  }
  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
