import { listCachedYoutubeCoursesByTechnology } from "../modules/youtube/youtube.repository";

async function test() {
  const items = await listCachedYoutubeCoursesByTechnology('JavaScript', 20, ['views']);
  console.log("Repository Result Order (Most Viewed):");
  items.forEach((item, i) => {
    console.log(`${i}: ${item.title} - ${item.views} views`);
  });
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
