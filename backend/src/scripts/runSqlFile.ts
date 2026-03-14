import { readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { buildDbConfig } from "../config/db";

async function main() {
  const relativePath = process.argv[2];

  if (!relativePath) {
    throw new Error("Usage: tsx src/scripts/runSqlFile.ts <relative-sql-path>");
  }

  const absolutePath = path.resolve(process.cwd(), relativePath);
  const sql = await readFile(absolutePath, "utf8");
  const connection = await mysql.createConnection(
    buildDbConfig({
      multipleStatements: true
    })
  );

  try {
    await connection.query(sql);
    console.info(`Applied SQL file: ${relativePath}`);
  } finally {
    await connection.end();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
