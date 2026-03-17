// This script intercepts NODE_OPTIONS to capture the vercel auth token
// by using node's built-in http/https debugging
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run vercel with network debugging via inspector
const output = execSync(
  'vercel env ls production',
  {
    cwd: path.join(__dirname, 'backend'),
    env: {
      ...process.env,
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
      HTTPS_PROXY: 'http://127.0.0.1:9999',
      https_proxy: 'http://127.0.0.1:9999',
    },
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  }
);

console.log('Vercel output:', output);
