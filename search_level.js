const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function searchMatches(pattern, title) {
  console.log(`\n=== ${title} ===`);
  const regex = new RegExp(pattern, 'gi');
  let match;
  while ((match = regex.exec(html)) !== null) {
    const start = Math.max(0, match.index - 200);
    const end = Math.min(html.length, match.index + 300);
    console.log(`--- Match at ${match.index} ---`);
    console.log(html.substring(start, end));
  }
}

searchMatches('pastCoursesModal', 'pastCoursesModal occurrences');
searchMatches('المرحلة|المرحله|المستوى|level', 'Level/Stage occurrences');
