// Smoke test for v2
console.log('Running tests for Health Tracker v2...');
const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server.js');
if (fs.existsSync(serverFile)) {
  console.log('✔ server.js exists');
} else {
  console.error('✘ server.js missing');
  process.exit(1);
}

const htmlFile = path.join(__dirname, 'public', 'index.html');
if (fs.existsSync(htmlFile)) {
  console.log('✔ public/index.html exists');
} else {
  console.error('✘ public/index.html missing');
  process.exit(1);
}

console.log('✔ All v2 sanity checks passed successfully!');
process.exit(0);
