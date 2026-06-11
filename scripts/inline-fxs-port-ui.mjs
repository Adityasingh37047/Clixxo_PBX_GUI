import fs from "fs";
import path from "path";

const ROOT = path.resolve("src/modules/FXS/Port");

// Re-use section bodies from advanced script pattern
const CORE = `
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: \`1px solid \${C.cardBorder}\`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </Component>
  );
};
`;

const MUI = `
const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";
`;

const NATIVE = `
const FOCUS_RING_SHADOW = (color) => \`0 0 0 1px \${color}\`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: \`1px solid \${OUTLINED_BORDER}\`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: nativeFieldInputStyle.width,
  minHeight: 32,
  padding: "6px 28px 6px 8px",
  fontSize: nativeFieldInputStyle.fontSize,
  lineHeight: 1.35,
  border: nativeFieldInputStyle.border,
  borderRadius: nativeFieldInputStyle.borderRadius,
  outline: nativeFieldInputStyle.outline,
  backgroundColor: nativeFieldInputStyle.backgroundColor,
  color: nativeFieldInputStyle.color,
  boxSizing: nativeFieldInputStyle.boxSizing,
  transition: nativeFieldInputStyle.transition,
  appearance: "auto",
};

const fxsNativeFieldInputStyle = nativeFieldInputStyle;
const fxsNativeFieldSelectStyle = nativeFieldSelectStyle;
const fxsNativeFieldInteraction = nativeFieldInteraction;
`;

const CHECKBOX = `
const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};
`;

const TABLE_CORE = `
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: \`1px solid \${C.cardBorder}\`,
      borderRight: \`1px solid \${C.cardBorder}\`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: \`1px solid \${C.cardBorder}\`,
  borderRight: \`1px solid \${C.cardBorder}\`,
  whiteSpace: "nowrap",
};

const numManipulateCardStyle = {
  background: "#ffffff",
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: \`1.5px solid \${C.cardBorder}\`,
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const numManipulateToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: \`1px solid \${C.cardBorder}\`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
};

const numManipulatePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: \`1px solid \${C.cardBorder}\`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
  overflow: "hidden",
};
`;

const TABLE_ROUTE = `
const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "7px 8px",
};

const routeThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};
`;

const TABLE_ZOOM = `
const getBrowserZoomPercent = () => {
  const scale = window.visualViewport?.scale;
  if (typeof scale === "number" && scale > 0) {
    return Math.round(scale * 100);
  }
  return 100;
};

const routeTableMinWidthForZoom = (widePx) => {
  const scale = window.visualViewport?.scale ?? 1;
  if (scale >= 1.15) return widePx;
  const zoomPct = getBrowserZoomPercent();
  return zoomPct >= 130 ? widePx : "100%";
};
`;

const ADVANCED = `
const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: 1000,
  margin: "0 auto",
};

const advancedFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: C.pageBg,
  border: \`1px solid \${C.cardBorder}\`,
  borderRadius: 8,
  padding: 20,
};

const PortBreadcrumb = ({ segments = [], current }) => (
  <div
    style={{
      fontSize: 12,
      color: C.mutedText,
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    {segments.map((seg) => (
      <React.Fragment key={seg}>
        <span>{seg}</span>
        <span>&gt;</span>
      </React.Fragment>
    ))}
    <span style={{ color: C.strongText, fontWeight: 600 }}>{current}</span>
  </div>
);

const FieldRow = ({
  label,
  children,
  required,
  align = "center",
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      gap: 12,
      minHeight: align === "flex-start" ? undefined : 32,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label}
      {required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);
`;

const SECTIONS = {
  core: CORE,
  mui: MUI,
  native: NATIVE,
  checkbox: CHECKBOX,
  tableCore: TABLE_CORE,
  tableRoute: TABLE_ROUTE,
  tableZoom: TABLE_ZOOM,
  advanced: ADVANCED,
};

const SYMBOL_SECTIONS = {
  C: ["core"],
  Btn: ["core"],
  checkboxSx: ["checkbox"],
  fxsNativeFieldInputStyle: ["mui", "native"],
  fxsNativeFieldSelectStyle: ["mui", "native"],
  fxsNativeFieldInteraction: ["mui", "native"],
  nativeFieldInputStyle: ["mui", "native"],
  nativeFieldSelectStyle: ["mui", "native"],
  nativeFieldInteraction: ["mui", "native"],
  TH: ["tableCore"],
  tdStyle: ["tableCore"],
  numManipulateCardStyle: ["tableCore"],
  numManipulateToolbarStyle: ["tableCore"],
  numManipulatePaginationStyle: ["tableCore"],
  routeTdStyle: ["tableCore", "tableRoute"],
  routeThExtra: ["tableCore", "tableRoute"],
  routeTableMinWidthForZoom: ["tableCore", "tableZoom"],
  getBrowserZoomPercent: ["tableCore", "tableZoom"],
  PortBreadcrumb: ["advanced"],
  FieldRow: ["advanced"],
  advancedFormPanelStyle: ["advanced"],
  advancedPageWrapStyle: ["advanced"],
  advancedPageInnerStyle: ["advanced"],
};

function buildInlineUi(symbols) {
  const needed = new Set(["core"]);
  for (const sym of symbols) {
    for (const sec of SYMBOL_SECTIONS[sym] || []) {
      needed.add(sec);
    }
  }
  const order = [
    "core",
    "mui",
    "native",
    "checkbox",
    "tableCore",
    "tableRoute",
    "tableZoom",
    "advanced",
  ];
  return (
    "\n// ── Local page UI (inlined from fxsSharedUi) ──\n" +
    order.filter((k) => needed.has(k)).map((k) => SECTIONS[k]).join("\n")
  );
}

function ensureReactImport(src) {
  if (/import React/.test(src)) return src;
  return src.replace(
    /^(import )/m,
    'import React from "react";\n$1',
  );
}

function patchFile(filename) {
  const filePath = path.join(ROOT, filename);
  let src = fs.readFileSync(filePath, "utf8");
  const importRe =
    /import\s*\{([^}]+)\}\s*from\s*["']\.\.\/\.\.\/\.\.\/shared\/fxsSharedUi["'];\s*\n?/g;

  const matches = [...src.matchAll(importRe)];
  if (!matches.length) {
    console.log(`skip: ${filename}`);
    return;
  }

  const symbols = matches.flatMap((m) =>
    m[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  src = src.replace(importRe, "");

  if (symbols.includes("PortBreadcrumb")) {
    src = ensureReactImport(src);
  }

  const inlineBlock = buildInlineUi(symbols);
  const anchor = src.match(/\nconst /);
  if (!anchor) throw new Error(`No anchor in ${filename}`);
  const idx = src.indexOf(anchor[0]);
  src = src.slice(0, idx) + inlineBlock + src.slice(idx);

  fs.writeFileSync(filePath, src);
  console.log(`patched: ${filename} (${symbols.length} symbols)`);
}

for (const file of fs.readdirSync(ROOT)) {
  if (file.endsWith(".jsx")) patchFile(file);
}
