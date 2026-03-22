import { query } from "../config/db";

async function run() {
  const techs = await query<any[]>("SELECT DISTINCT technology FROM youtube_courses", []);
  console.log("Tech Labels and Lengths:");
  techs.forEach(t => {
    console.log(`"${t.technology}" - length: ${t.technology.length}`);
  });
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
