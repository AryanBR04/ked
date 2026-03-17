import { execute } from "./src/config/db";
import fs from "fs";
import path from "path";

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, "db", "migrations", "008_saved_courses.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");
    
    console.log("Running migration...");
    await execute(sql);
    console.log("Migration successful!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
