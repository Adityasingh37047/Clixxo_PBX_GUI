const fs = require("fs");
const p = "D:/Clixxo_PBX_GUI/src/modules/PBX/CallFeatures/PickupGroup.jsx";
let t = fs.readFileSync(p, "utf8");
const start = t.indexOf("const SectionHeading = (");
const end = t.indexOf("// ─", start);
if (start < 0 || end < 0) throw new Error("markers");
const rep = `const SectionHeading = ({
  title,
  isFirst = false,
  required,
  tooltip,
}) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: \`1px solid \${C.cardBorder}\` }} />

    <Tooltip
      title={tooltip || ""}
      {...tooltipProps}
      disableHoverListener={!tooltip}
    >
      <span
        style={{
          position: "absolute",
          top: -10,
          left: 0,
          background: PBX_MODAL_SECTION_BG,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
          cursor: tooltip ? "help" : "default",
        }}
      >
        {title}
        {required && <span style={{ color: C.errorRed }}> *</span>}
      </span>
    </Tooltip>
  </div>
);

`;
t = t.slice(0, start) + rep + t.slice(end);
fs.writeFileSync(p, t, "utf8");
console.log("fixed SectionHeading");
