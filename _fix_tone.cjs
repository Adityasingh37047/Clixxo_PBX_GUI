const fs = require("fs");
const { execSync } = require("child_process");
const p = "D:/Clixxo_PBX_GUI/src/modules/FXS/Advanced/ToneDetecterPage.jsx";
let t = fs.readFileSync(p, "utf8");
const ours = execSync(
  "git show :2:src/modules/FXS/Advanced/ToneDetecterPage.jsx",
  { cwd: "D:/Clixxo_PBX_GUI", encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
);
const start = ours.indexOf("{TONE_DETECTER_FIELDS.map");
const end = ours.indexOf("</DialogContent>", start);
const block = ours.slice(start, end);
const withTooltip = block.replace(
  /label=\{field\.label\}\n(\s*)labelWidth=/,
  "label={field.label}\n$1tooltipKey={field.name}\n$1labelWidth="
);
const s = t.indexOf("{TONE_DETECTER_FIELDS.map");
const e = t.indexOf("</DialogContent>", s);
if (s < 0 || e < 0) throw new Error("markers not found in target");
t = t.slice(0, s) + withTooltip + t.slice(e);
fs.writeFileSync(p, t, "utf8");
console.log("patched ToneDetecter modal fields");
