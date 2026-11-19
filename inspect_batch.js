const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function findCalls(str) {
  console.log(`=== Matches for: ${str} ===`);
  let idx = 0;
  while ((idx = html.indexOf(str, idx)) !== -1) {
    console.log(`At pos ${idx}:`);
    console.log(html.substring(Math.max(0, idx - 150), Math.min(html.length, idx + 200)));
    console.log('---------------------------------');
    idx += str.length;
  }
}

findCalls('checkPastCoursesRequirement');
findCalls('displayStudentBatch');
findCalls('ALL_BATCHES');
