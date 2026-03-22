import { query } from "../config/db";

async function run() {
  const hex = await query<any[]>("SELECT HEX(technology) as h, technology FROM youtube_courses WHERE technology LIKE '%Java%' LIMIT 1", []);
  console.log("HEX for Java in DB:", hex[0]?.h);
  console.log("HEX for 'Java' string:", Buffer.from("Java").toString('hex').toUpperCase());
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
