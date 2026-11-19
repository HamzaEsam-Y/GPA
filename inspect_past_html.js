const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('id="past-courses-modal"');
const eIdx = html.indexOf('<!-- Quick Grade Legend Modal', sIdx);
console.log(html.substring(sIdx, eIdx !== -1 ? eIdx : sIdx + 4000));
