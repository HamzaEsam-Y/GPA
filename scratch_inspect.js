const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

let idx = html.indexOf("activeCoursesMap =", html.indexOf("function recalculateAll"));
console.log(html.substring(idx, idx + 2500));
