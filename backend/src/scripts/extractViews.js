const fs = require('fs');
const content = fs.readFileSync('search_result.json', 'utf16le');
const data = JSON.parse(content);
const views = data.items.map(i => i.views);
console.log("Views in JSON Order:", views.join(", "));
process.exit(0);
