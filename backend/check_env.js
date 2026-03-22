const { env } = require('./src/config/env');
const key = env.YOUTUBE_API_KEY || 'NOT_FOUND';
console.log('API Key Found:', key.substring(0, 5) + '...' + key.substring(key.length - 3));
console.log('CWD:', process.cwd());
