import { query } from "../config/db";

async function run() {
  const res = await query<any[]>("SHOW CREATE TABLE youtube_courses", []);
  console.log("TABLE_DEFINITION_START");
  console.log(res[0]['Create Table']);
  console.log("TABLE_DEFINITION_END");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
