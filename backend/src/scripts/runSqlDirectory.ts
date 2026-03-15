import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { buildDbConfig } from "../config/db";

async function main() {
  const relativeDirectory = process.argv[2];

  if (!relativeDirectory) {
    throw new Error("Usage: tsx src/scripts/runSqlDirectory.ts <relative-sql-directory>");
  }

  const absoluteDirectory = path.resolve(process.cwd(), relativeDirectory);
  const files = (await readdir(absoluteDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  const connection = await mysql.createConnection(
    buildDbConfig({
      multipleStatements: true
    })
  );

  try {
    for (const file of files) {
      const sql = await readFile(path.join(absoluteDirectory, file), "utf8");
      await connection.query(sql);
      console.info(`Applied SQL file: ${path.join(relativeDirectory, file)}`);
    }
  } finally {
    await connection.end();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
