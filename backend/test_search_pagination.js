const axios = require('axios');

async function testSearch(technology) {
  console.log(`\nTesting search for: ${technology}`);
  try {
    const response = await axios.get(`http://localhost:5000/api/youtube/search?q=${technology}`);
    const results = response.data.items || [];
    console.log(`Results found: ${results.length}`);
    
    if (results.length > 0) {
      console.log('Top 3 results:');
      results.slice(0, 3).forEach((item, i) => {
        console.log(`${i+1}. ${item.title} (${item.channel_name}) - Views: ${item.views}, Score: ${item.ranking_score}`);
      });
    }

    if (results.length < 20) {
      console.error(`FAILED: Only found ${results.length} results for ${technology}. Expected at least 20.`);
    } else {
      console.log(`SUCCESS: Found ${results.length} results for ${technology}.`);
    }
  } catch (error) {
    console.error(`Error searching for ${technology}:`, error.response?.data || error.message);
  }
}

async function runTests() {
  await testSearch('Python');
  await testSearch('React');
  await testSearch('Machine Learning');
}

runTests();
