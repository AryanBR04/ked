import axios from 'axios';

async function test() {
  try {
    console.log("Testing API Sort (Most Viewed)...");
    const response = await axios.get('http://localhost:5000/api/youtube/search?tech=JavaScript&sortBy=views');
    const items = response.data.items;
    
    console.log("Returned Order:");
    items.forEach((item: any, i: number) => {
      console.log(`${i}: ${item.title} - ${item.views} views`);
    });
  } catch (err: any) {
    console.error("Error:", err.response?.data || err.message);
  }
}

test();
