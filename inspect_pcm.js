const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const pcmStart = content.indexOf('id="past-courses-modal"');
console.log('HTML of past-courses-modal:');
console.log(content.slice(pcmStart - 10, pcmStart + 3500));

console.log('\n====================================\n');
const jsStart = content.indexOf('function openPastCoursesModal');
console.log(content.slice(jsStart, jsStart + 6000));
