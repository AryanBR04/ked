import { query } from "../config/db";

async function run() {
  const all = await query<any[]>("SELECT title, technology, cache_expires_at FROM youtube_courses WHERE title LIKE '%Java for Beginners%'", []);
  console.log("Results for 'Java for Beginners':");
  console.table(all);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
