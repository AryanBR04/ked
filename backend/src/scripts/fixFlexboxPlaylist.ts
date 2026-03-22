import { query } from "../config/db";

async function run() {
  console.log("Updating CSS Flexbox playlist ID...");
  const oldId = 'PL4cUxeGkcC9gfoIgnXVzcjmc0z2UksT_E';
  const newId = 'PL4cUxeGkcC9i3FXJSUfmsNOx8E7u6UuhG';

  const r1 = await query(
    "UPDATE career_track_steps SET playlist_id = ? WHERE playlist_id = ?",
    [newId, oldId]
  );
  const r2 = await query(
    "UPDATE learning_path_steps SET playlist_id = ? WHERE playlist_id = ?",
    [newId, oldId]
  );
  console.log("Updated database successfully.");
  console.log("Career Track Steps affected:", (r1 as any).affectedRows);
  console.log("Learning Path Steps affected:", (r2 as any).affectedRows);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
