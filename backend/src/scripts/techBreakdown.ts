import { query } from "../config/db";

async function run() {
  const stats = await query<any[]>(
    "SELECT technology, COUNT(*) as cnt FROM youtube_courses GROUP BY technology ORDER BY cnt DESC",
    []
  );
  console.log("Technology Breakdown:");
  console.table(stats);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
