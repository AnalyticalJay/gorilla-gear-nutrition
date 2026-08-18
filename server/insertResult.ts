/**
 * mysql2 exposes insert results as a tuple whose first element is the result
 * header. Some adapters return the header directly, so support both forms.
 */
export function getInsertId(result: unknown, entity: string): number {
  const header = Array.isArray(result) ? result[0] : result;
  const insertId = Number((header as { insertId?: unknown } | undefined)?.insertId);
  if (!Number.isSafeInteger(insertId) || insertId <= 0) {
    throw new Error(`Unable to determine the inserted ${entity} ID`);
  }
  return insertId;
}
