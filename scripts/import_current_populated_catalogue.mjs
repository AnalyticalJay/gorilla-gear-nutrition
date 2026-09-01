import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { appRouter } from "../server/routers.ts";

const csvPath = resolve(process.cwd(), "products-current-populated-dual-taxonomy.csv");
const csvData = readFileSync(csvPath, "utf8");

const caller = appRouter.createCaller({
  req: {},
  res: {},
  user: { id: 0, role: "admin" },
});

const result = await caller.products.bulkImportCSV({ csvData });
console.log(JSON.stringify({ csvPath, ...result }, null, 2));
