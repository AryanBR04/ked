import { query } from "../config/db";

async function run() {
  const courses = await query<any[]>(
    "SELECT title, published_date, ranking_score FROM youtube_courses WHERE technology = 'JavaScript' ORDER BY published_date DESC, ranking_score DESC LIMIT 5",
    []
  );
  console.log("JavaScript Top 5 by Newest (SQL Sort):");
  console.table(courses);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
