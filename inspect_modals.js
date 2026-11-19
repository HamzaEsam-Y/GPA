const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function printBlock(id) {
  const target = `id="${id}"`;
  const idx = html.indexOf(target);
  if (idx === -1) {
    console.log(`id ${id} not found`);
    return;
  }
  console.log(`=== BLOCK ${id} ===`);
  console.log(html.substring(Math.max(0, idx - 100), Math.min(html.length, idx + 2500)));
}

printBlock('profile-modal');
printBlock('past-courses-modal');
