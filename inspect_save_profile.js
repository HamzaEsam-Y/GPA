const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('function saveProfileData');
console.log(html.substring(sIdx, sIdx + 1500));
