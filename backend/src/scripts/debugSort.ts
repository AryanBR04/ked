import { query } from "../config/db";

async function run() {
  const courses = await query<any[]>(
    "SELECT title, views, likes, published_date, ranking_score FROM youtube_courses WHERE technology = 'JavaScript' ORDER BY views DESC LIMIT 5",
    []
  );
  console.log("JavaScript Top 5 by Views (SQL Sort):");
  console.table(courses);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
