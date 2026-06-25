const fs = require("fs");
const p = "D:/Clixxo_PBX_GUI/src/modules/System/System Settings/AccessControl.jsx";
let t = fs.readFileSync(p, "utf8");
const insert = `const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_DANGER,
};

`;
const marker =
  'const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title, startIcon }) => (';
const idx = t.indexOf(marker);
if (idx < 0) throw new Error("marker not found");
const dangerIdx = t.lastIndexOf("const BTN_DANGER", idx);
if (dangerIdx < 0) throw new Error("BTN_DANGER not found");
const dangerLineEnd = t.indexOf("\n", dangerIdx) + 1;
t = t.slice(0, dangerLineEnd) + "\n" + insert + t.slice(idx);
fs.writeFileSync(p, t, "utf8");
console.log("fixed AccessControl");
