const fs = require("fs");
const p = "D:/Clixxo_PBX_GUI/src/modules/Maitenance/System Tools/Radius.jsx";
let t = fs.readFileSync(p, "utf8");
const re =
  /<span style=\{\{ color: C\.labelText \}\}>\s*\{field\.label\}\s*<\/span>\s*<\/Tooltip>/g;
const rep = `<Tooltip title={tooltips[field.name]} {...tooltipProps}>
                            <span style={{ color: C.labelText }}>
                              {field.label}
                            </span>
                          </Tooltip>`;
const count = (t.match(re) || []).length;
t = t.replace(re, rep);
fs.writeFileSync(p, t, "utf8");
console.log("replaced", count);
console.log("Tooltip opens", (t.match(/<Tooltip/g)||[]).length, "closes", (t.match(/<\/Tooltip>/g)||[]).length);
