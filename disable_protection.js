const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

// Find vercel auth token
const possiblePaths = [
  path.join(os.homedir(), 'AppData', 'Roaming', 'Vercel', 'auth.json'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'com.vercel.cli', 'auth.json'),
  path.join(os.homedir(), '.vercel', 'auth.json'),
  path.join(os.homedir(), '.vercel', 'token'),
];

let token = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    console.log('Found auth file at:', p);
    try {
      const content = fs.readFileSync(p, 'utf8');
      const parsed = JSON.parse(content);
      token = parsed.token;
      console.log('Token found (first 10 chars):', token ? token.substring(0, 10) + '...' : 'NOT FOUND');
    } catch(e) {
      console.log('Content:', fs.readFileSync(p, 'utf8').substring(0, 200));
    }
    break;
  }
}

if (!token) {
  console.log('No auth.json found, tried:', possiblePaths);
  console.log('Hint: try setting VERCEL_TOKEN env variable and pass as arg');
  process.exit(1);
}

// Disable Deployment Protection via Vercel API
// Project ID from .vercel/project.json
const projectId = 'prj_WhHEXuY1SRw66KhXzTa5fwf7niUk';

const data = JSON.stringify({
  ssoProtection: null
});

const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: `/v9/projects/${projectId}`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (resp) => {
  let body = '';
  resp.on('data', (chunk) => body += chunk);
  resp.on('end', () => {
    console.log('Status:', resp.statusCode);
    console.log('Response:', body.substring(0, 500));
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
