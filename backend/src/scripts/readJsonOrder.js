const fs = require('fs');
const content = fs.readFileSync('search_result.json', 'utf16le');
const data = JSON.parse(content);
console.log("JSON Items Order:");
data.items.forEach((item, i) => {
  console.log(`${i}: ${item.title} - ${item.views} views - ${item.published_date}`);
});
