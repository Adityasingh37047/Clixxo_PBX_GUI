import fs from "fs";
import path from "path";

const ROOT = path.resolve("src/modules/PBX/SIP");
const SIP_REGISTER = fs.readFileSync(
  path.resolve("src/modules/PBX/Trunks/SipRegisterPage.jsx"),
  "utf8",
);

function sliceBetween(src, startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  const end = src.indexOf(endMarker, start);
  if (start === -1 || end === -1) {
    throw new Error(`Markers not found: ${startMarker} -> ${endMarker}`);
  }
  return src.slice(start, end).trimEnd();
}

const CORE_UI = sliceBetween(
  SIP_REGISTER,
  "// ── Local page UI (inlined from pbxSharedUi) ──\n",
  "const PBX_MODAL_TAB_BAR_STYLE",
);

const SIP_PCM_LIST_UI = sliceBetween(
  SIP_REGISTER,
  "const SIP_PCM_TABLE_CARD_RADIUS = 10;",
  "const DOD_DUAL_LIST_LABEL_OFFSET",
);

const LIST_EXTRAS = `
const C = {
  ...C,
  errorRed: "#ef4444",
};

const sipPcmCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const sipPcmPageWrapStyle = pbxPageWrapStyle;
const sipPcmInnerStyle = pbxPageInnerStyle;

const SipPcmBreadcrumb = ({ current }) => (
  <PbxBreadcrumb section="SIP" current={current} />
);

const pbxModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};
`;

// Fix LIST_EXTRAS - can't spread C before C is defined. Add errorRed to C directly in patch.
const LIST_EXTRAS_FIXED = `
const sipPcmCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const sipPcmPageWrapStyle = pbxPageWrapStyle;
const sipPcmInnerStyle = pbxPageInnerStyle;

const SipPcmBreadcrumb = ({ current }) => (
  <PbxBreadcrumb section="SIP" current={current} />
);

const pbxModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};
`;

const FORM_UI = `
const CARD_RADIUS = 10;

const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const PbxBreadcrumb = ({ section, current, style }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "nowrap",
      whiteSpace: "nowrap",
      lineHeight: 1.5,
      ...style,
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const SipPcmBreadcrumb = ({ current }) => (
  <PbxBreadcrumb section="SIP" current={current} />
);

const sipPcmFormPageWrapStyle = {
  ...pbxPageWrapStyle,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const sipPcmFormPageInnerStyle = {
  ...pbxPageInnerStyle,
  maxWidth: 1000,
};

const sipPcmFormCardStyle = {
  background: "#ffffff",
  borderRadius: 10,
  overflow: "hidden",
  border: \`1.5px solid \${C.cardBorder}\`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmFormHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: \`1px solid \${C.cardBorder}\`,
};

const SIP_PCM_AUTH_FIELD_WIDTH = 200;
const SIP_PCM_FORM_FIELD_HEIGHT = 32;
const SIP_PCM_FORM_STACK_CLASS = "space-y-4";
const SIP_PCM_FORM_ROW_CLASS = "flex items-center justify-between";

const sipPcmFormLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  width: 320,
  marginRight: 10,
  lineHeight: 1.4,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const sipPcmFormControlWrapStyle = {
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
  flexShrink: 0,
};

const sipPcmAuthInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: \`1px solid \${OUTLINED_BORDER}\`,
  fontSize: 12,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  height: SIP_PCM_FORM_FIELD_HEIGHT,
  minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
  paddingLeft: 12,
  paddingRight: 12,
  lineHeight: \`\${SIP_PCM_FORM_FIELD_HEIGHT - 2}px\`,
  textAlign: "left",
  backgroundColor: "#ffffff",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const sipPcmAuthInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  ...muiSelectInnerSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: OUTLINED_HOVER },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const sipPcmAuthMuiSelectSx = {
  ...muiSelectSx,
  fontSize: 12,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  "& .MuiOutlinedInput-root": {
    height: SIP_PCM_FORM_FIELD_HEIGHT,
    minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
    backgroundColor: "#ffffff",
    transition: "border-color 0.2s ease",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: OUTLINED_HOVER },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
  "& .MuiSelect-select": {
    padding: "0 32px 0 12px !important",
    fontSize: 12,
    lineHeight: \`\${SIP_PCM_FORM_FIELD_HEIGHT - 2}px\`,
    height: "100%",
    minHeight: "unset !important",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
};

const sipPcmAuthFormFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 20px",
  borderTop: \`1px solid \${C.cardBorder}\`,
  boxSizing: "border-box",
};

const sipPcmAuthFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const SipPcmSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: \`1px solid \${C.cardBorder}\` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#30415A",
      }}
    >
      {title}
    </span>
  </div>
);
`;

const IMPORT_RE =
  /import\s*\{[^}]+\}\s*from\s*["']\.\.\/\.\.\/\.\.\/shared\/pbxSharedUi["'];\s*\n?/g;

function addErrorRedToC(src) {
  if (src.includes("errorRed:")) return src;
  return src.replace(
    /(const C = \{[\s\S]*?accent: "#3E5475",)\n(\s*amber:)/,
    '$1\n  errorRed: "#ef4444",\n$2',
  );
}

function stripSharedImports(src) {
  return src.replace(IMPORT_RE, "");
}

function patchFile(filename, inlineBlock, addErrorRed = false) {
  const filePath = path.join(ROOT, filename);
  let src = fs.readFileSync(filePath, "utf8");

  if (!src.includes('from "../../../shared/pbxSharedUi"')) {
    console.log(`skip (no import): ${filename}`);
    return;
  }

  src = stripSharedImports(src);
  let block = inlineBlock;
  if (addErrorRed) {
    block = addErrorRedToC(block);
  }

  const anchor = src.match(/\n(const |\/\*\*)/);
  if (!anchor) throw new Error(`No anchor in ${filename}`);
  const idx = src.indexOf(anchor[0]);
  src = `${src.slice(0, idx)}\n${block}\n${src.slice(idx)}`;

  fs.writeFileSync(filePath, src);
  console.log(`patched: ${filename}`);
}

const LIST_UI =
  CORE_UI.replace(
    'accent: "#3E5475",',
    'accent: "#3E5475",\n  errorRed: "#ef4444",',
  ) +
  "\n\n" +
  SIP_PCM_LIST_UI +
  "\n" +
  LIST_EXTRAS_FIXED;

const FORM_CORE = sliceBetween(
  SIP_REGISTER,
  "const C = {",
  "const pbxPageWrapStyle",
)
  .replace(/^const C = \{\n/, "")
  .trimEnd();

// FORM uses smaller core: C, Btn, OUTLINED + nativeFieldInteraction only
const FORM_CORE_UI = `// ── Local page UI (inlined from pbxSharedUi) ──
const C = {
${FORM_CORE}

const Btn = ` + sliceBetween(SIP_REGISTER, "const Btn = ", "const TH = ").trimStart();

// That's getting messy. Use FORM_UI with full Btn from CORE start

const FORM_BLOCK =
  sliceBetween(SIP_REGISTER, "const C = {", "const pbxPageWrapStyle =").trimEnd() +
  ";\n\n" +
  sliceBetween(SIP_REGISTER, "const Btn = ", "const pbxPageWrapStyle =").trimEnd() +
  "\n\n" +
  sliceBetween(SIP_REGISTER, "const OUTLINED_BORDER", "const pbxPageWrapStyle =").trimEnd() +
  "\n\n" +
  FORM_UI;

patchFile("SipToSipAccountPage.jsx", LIST_UI);
patchFile("SipTrunkGroup.jsx", LIST_UI);
patchFile("SipMediaPage.jsx", FORM_BLOCK);
