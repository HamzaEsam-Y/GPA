const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const target = 'data-lucide="rotate-ccw"';
let idx = 0;
while ((idx = html.indexOf(target, idx)) !== -1) {
  console.log('=== MATCH AT ' + idx + ' ===');
  console.log(html.substring(Math.max(0, idx - 400), Math.min(html.length, idx + 400)));
  idx += target.length;
}
