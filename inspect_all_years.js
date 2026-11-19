const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('allYearsCourses =');
console.log(html.substring(sIdx - 50, sIdx + 500));
