import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { eq, like } from 'drizzle-orm';

function canonicalKey(imageKey: string | null) {
  return (imageKey ?? '').replace(/_[a-f0-9]{8}(?=\.[^.]+$)/i, '');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const rows = await db.select().from(schema.productImages).where(like(schema.productImages.imageKey, 'new_brand_images/%'));
  const bySource = new Map<string, typeof rows>();
  for (const row of rows) {
    const sourceKey = `${row.productId}|${canonicalKey(row.imageKey)}`;
    bySource.set(sourceKey, [...(bySource.get(sourceKey) ?? []), row]);
  }

  const duplicateIds: number[] = [];
  for (const items of Array.from(bySource.values())) {
    for (const row of items.sort((a, b) => a.id - b.id).slice(1)) duplicateIds.push(row.id);
  }

  const wrongClenbuterolIds = rows
    .filter((row) => row.productId === 2052 && canonicalKey(row.imageKey).includes('NOVA_LABS__Oral_Anabolics__Clenbuterol_40'))
    .map((row) => row.id);
  const idsToDelete = Array.from(new Set([...duplicateIds, ...wrongClenbuterolIds]));

  console.log(`new_brand_rows=${rows.length} duplicate_rows=${duplicateIds.length} wrong_clenbuterol_rows=${wrongClenbuterolIds.length} delete_count=${idsToDelete.length} dry_run=${dryRun}`);
  if (!dryRun) {
    for (const id of idsToDelete) {
      await db.delete(schema.productImages).where(eq(schema.productImages.id, id));
    }
  }
  console.log(`deleted=${dryRun ? 0 : idsToDelete.length}`);
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
