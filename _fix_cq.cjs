const fs = require("fs");
const p = "D:/Clixxo_PBX_GUI/src/modules/PBX/CallFeatures/CallQueue.jsx";
let t = fs.readFileSync(p, "utf8");
const start = t.indexOf("const FieldRow = ({ label, children, tooltip }) => (");
const end = t.indexOf("const tooltipProps = {", start);
if (start < 0 || end < 0) throw new Error("markers");
const rep = `const FieldRow = ({ label, children, tooltip }) => (
  <div
    className="flex items-center rounded px-2 py-0.5 gap-2"
    style={{
      minHeight: 30,
    }}
  >
    <Tooltip
      title={tooltip || ""}
      {...tooltipProps}
      disableHoverListener={!tooltip}
    >
      <label
        className="text-[13px] text-[var(--text-secondary)] font-medium whitespace-nowrap text-left"
        style={{
          width: LABEL_W,
          flexShrink: 0,
          position: "relative",
          left: "-8px",
          color: C.accent,
          cursor: tooltip ? "help" : "default",
        }}
      >
        {label}
      </label>
    </Tooltip>

    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

`;
t = t.slice(0, start) + rep + t.slice(end);
fs.writeFileSync(p, t, "utf8");
console.log("fixed FieldRow");
