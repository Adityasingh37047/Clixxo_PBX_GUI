const fs = require("fs");
const p = "D:/Clixxo_PBX_GUI/src/modules/Maitenance/System Tools/Radius.jsx";
let t = fs.readFileSync(p, "utf8");
t = t.replace(
  /<Tooltip title=\{tooltips\[field\.name\]\} \{\.\.\.tooltipProps\}>\s*<Tooltip title=\{tooltips\[field\.name\]\} \{\.\.\.tooltipProps\}>/g,
  "<Tooltip title={tooltips[field.name]} {...tooltipProps}>"
);
fs.writeFileSync(p, t, "utf8");
console.log("deduped nested Tooltip");
