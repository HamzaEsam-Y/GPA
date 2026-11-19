const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const targetIdx = html.indexOf('function openPastCoursesModal');
console.log('--- BEFORE openPastCoursesModal (1000 chars) ---');
console.log(html.substring(targetIdx - 1500, targetIdx));

console.log('--- openPastCoursesModal and after (3000 chars) ---');
console.log(html.substring(targetIdx, targetIdx + 3000));
