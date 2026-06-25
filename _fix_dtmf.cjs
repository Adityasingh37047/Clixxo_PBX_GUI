const fs = require("fs");
const p = "D:/Clixxo_PBX_GUI/src/modules/FXS/Advanced/DtmfPage.jsx";
let t = fs.readFileSync(p, "utf8");
t = t.replace(
  /\n\s*<div style=\{\{ marginTop: 16, width: "100%" \}\}>\n\s*<DtmfFormCard title="DTMF Generator">/,
  '\n      <DtmfFormCard title="DTMF Generator">'
);
fs.writeFileSync(p, t, "utf8");
console.log("removed wrapper div");
