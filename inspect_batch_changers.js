const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<select[^>]*batch[^>]*>|<select[^>]*id="[^"]*batch[^"]*"[^>]*>/gi;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[0]);
}

// Also check any onclick or onchange changing displayStudentBatch
const batchChanges = [];
const r2 = /displayStudentBatch.*?=/g;
while ((m = r2.exec(html)) !== null) {
  console.log(html.substring(m.index - 50, m.index + 100));
}
