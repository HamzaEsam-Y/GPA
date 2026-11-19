const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const sIdx = content.indexOf('function handleCourseSearchKeydown');
console.log(content.slice(sIdx, sIdx + 1500));
