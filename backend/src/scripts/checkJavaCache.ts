import { query } from "../config/db";

async function run() {
  const courses = await query<any[]>(
    "SELECT title, views, cache_expires_at, UTC_TIMESTAMP() as now FROM youtube_courses WHERE technology = 'Java' ORDER BY views DESC LIMIT 10",
    []
  );
  console.log("Java Cache Status:");
  console.table(courses);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
