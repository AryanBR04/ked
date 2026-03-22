import { query } from "../config/db";

async function run() {
  const res = await query<any[]>("SELECT UTC_TIMESTAMP() as db_now, NOW() as db_local_now", []);
  console.log("DB Time Stats:", res[0]);
  
  const java = await query<any[]>("SELECT title, cache_expires_at FROM youtube_courses WHERE technology = 'Java' LIMIT 1", []);
  console.log("Java Sample Expiry:", java[0]);
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
