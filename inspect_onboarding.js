const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Look for modalStudentBatch and profile modal and initial load
const pIdx = html.indexOf('id="profileModal"');
if (pIdx !== -1) {
  console.log('--- profileModal (first 1000 chars) ---');
  console.log(html.substring(pIdx, pIdx + 1200));
}

// Look for init or checkProfileCompletion or first-time onboarding
const initIdx = html.indexOf('checkProfileCompletion');
if (initIdx !== -1) {
  console.log('--- checkProfileCompletion (800 chars) ---');
  console.log(html.substring(initIdx - 100, initIdx + 800));
}

// Look for window.onload or DOMContentLoaded
const loadIdx = html.indexOf('DOMContentLoaded');
if (loadIdx !== -1) {
  console.log('--- DOMContentLoaded (1000 chars) ---');
  console.log(html.substring(loadIdx - 50, loadIdx + 1200));
}
