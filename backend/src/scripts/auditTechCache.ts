import { query } from "../config/db";

async function run() {
  const techs = ["Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift"];
  console.log("Technology Cache Status:");
  
  for (const tech of techs) {
    const count = await query<any[]>("SELECT COUNT(*) as cnt FROM youtube_courses WHERE technology = ?", [tech]);
    const valid = await query<any[]>("SELECT COUNT(*) as cnt FROM youtube_courses WHERE technology = ? AND cache_expires_at > UTC_TIMESTAMP()", [tech]);
    console.log(`${tech}: ${count[0].cnt} total, ${valid[0].cnt} valid cache`);
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
