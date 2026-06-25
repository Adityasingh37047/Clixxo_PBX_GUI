const fs = require("fs");
const p = "D:/Clixxo_PBX_GUI/src/modules/FXS/VoIP/FxsVoipMediaPage.jsx";
let t = fs.readFileSync(p, "utf8");
t = t.replace(
  /const codecDualListSelectStyle = \{[\s\S]*?\}\);/,
  `const codecDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: \`1px solid \${C.cardBorder}\`,
  background: "#fff",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
  overflowX: "hidden",
};`
);
fs.writeFileSync(p, t, "utf8");
console.log("fixed");
