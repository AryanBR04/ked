import { env } from "./src/config/env";
import * as fs from "fs";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

async function checkQuota() {
  const url = new URL(`${YOUTUBE_API_BASE_URL}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", "test");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("key", env.YOUTUBE_API_KEY || "");

  let output = `Checking quota with API Key: ${env.YOUTUBE_API_KEY ? "CONFIGURED" : "MISSING"}\n`;
  
  try {
    const response = await fetch(url.toString());
    const data = await response.json() as any;
    
    if (response.ok) {
      output += "SUCCESS: YouTube API is working. Quota has NOT been reached.\n";
      output += `Sample result title: ${data.items?.[0]?.snippet?.title}\n`;
    } else {
      output += `FAILURE: YouTube API returned status ${response.status}\n`;
      output += `Error details: ${JSON.stringify(data.error, null, 2)}\n`;
      
      if (data.error?.errors?.some((e: any) => e.reason === 'quotaExceeded')) {
        output += "Confirmed: Your YouTube API quota HAS been reached.\n";
      } else {
        output += "Reason for failure is NOT quota related.\n";
      }
    }
  } catch (error: any) {
    output += `An error occurred while checking quota: ${error.message}\n`;
  }
  
  console.log(output);
  fs.writeFileSync("quota_result.txt", output);
}

checkQuota();
