import { query } from "../config/db";

async function run() {
  const courses = await query<any[]>(
    "SELECT title, views, cache_expires_at, UTC_TIMESTAMP() as now FROM youtube_courses WHERE technology = 'JavaScript' ORDER BY views DESC LIMIT 10",
    []
  );
  console.log("JavaScript Top 10 Views + Cache State:");
  console.table(courses);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
