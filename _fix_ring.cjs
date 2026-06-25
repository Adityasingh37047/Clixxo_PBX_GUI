const fs = require("fs");
const p = "D:/Clixxo_PBX_GUI/src/modules/FXS/Advanced/RingingSchemePage.jsx";
let t = fs.readFileSync(p, "utf8");
t = t.replace(
  /\{\[1, 2, 3, 4\]\.map\(\(n\) => renderSchemeContent\(n\)\)\}\s*<\/div>\s*\{\[1, 2, 3, 4\]\.map\(\(n\) => renderSchemeContent\(n\)\)\}\s*<\/div>/,
  "{[1, 2, 3, 4].map((n) => renderSchemeContent(n))}\n          </div>"
);
fs.writeFileSync(p, t, "utf8");
console.log("done");
