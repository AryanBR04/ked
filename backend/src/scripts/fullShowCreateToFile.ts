import { query } from "../config/db";
import fs from 'fs';

async function run() {
  const res = await query<any[]>("SHOW CREATE TABLE youtube_courses", []);
  fs.writeFileSync('c:\\tmp\\full_create.sql', res[0]['Create Table']);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
