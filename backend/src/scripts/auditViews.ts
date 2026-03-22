import { query } from "../config/db";

async function run() {
  const courses = await query<any[]>(
    "SELECT technology, title, views FROM youtube_courses ORDER BY views DESC LIMIT 10",
    []
  );
  console.log("Top 10 Courses by Views (Any Tech):");
  console.table(courses);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
