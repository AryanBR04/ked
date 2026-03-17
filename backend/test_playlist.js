
const { env } = require('./src/config/env');
const fetch = require('node-fetch');

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const playlistId = "PLUaB-1hjhk8HQnEV40YmOqLp4A7yE8v0v";

async function testPlaylist() {
  const url = new URL(`${YOUTUBE_API_BASE_URL}/playlists`);
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("id", playlistId);
  url.searchParams.set("key", env.YOUTUBE_API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json();
  
  console.log(JSON.stringify(data, null, 2));
}

testPlaylist().catch(console.error);
