const fs = require("fs");
const p = "D:/Clixxo_PBX_GUI/src/modules/Maitenance/System Tools/Radius.jsx";
let t = fs.readFileSync(p, "utf8");
const re =
  /<div className="flex items-center text-\[13px\] font-semibold text-\[var\(--text-muted\)\][^>]*>[\s\S]*?\{field\.label\}[\s\S]*?<\/Tooltip>\s*<\/div>/;
const rep = `<div className="flex items-center text-[13px] font-semibold text-[var(--text-muted)] text-left pl-2 sm:pl-4 break-words">
                          <Tooltip title={tooltips[field.name]} {...tooltipProps}>
                            <span style={{ color: C.labelText }}>
                              {field.label}
                            </span>
                          </Tooltip>
                        </div>`;
if (!re.test(t)) {
  console.error("no match");
  process.exit(1);
}
t = t.replace(re, rep);
fs.writeFileSync(p, t, "utf8");
console.log("fixed");
