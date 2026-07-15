#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIP = path.join(__dirname, "../src/modules/E1-PRI/SIP");

function write(rel, content) {
  const full = path.join(SIP, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel, content.split("\n").length);
}

write(
  "components/SipMediaTableHelpers.js",
  `import { SIP_MEDIA_SECTION_HEADING_COLOR } from "../../../../constants/SipMediaConstants";

export const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
  sectionHeading: SIP_MEDIA_SECTION_HEADING_COLOR,
};

export const CARD_RADIUS = 4;
export const FIELD_RADIUS = 6;
export const SIP_MEDIA_COMPACT_MQ = "(max-width: 768px)";
export const SIP_MEDIA_SCROLL_CLASS = "sip-media-scroll";
export const SIP_MEDIA_LABEL_COL_WIDTH = 200;
export const SIP_MEDIA_CONTROL_COL_WIDTH = 220;
export const SIP_MEDIA_FIELD_COL_GAP = 8;
export const SIP_MEDIA_FORM_PAD_X = 28;
export const SIP_MEDIA_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

export const sipFormTextStyle = {
  fontSize: 13,
  color: C.labelText,
};

export const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

export const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

export const advancedCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: 0,
  boxSizing: "border-box",
};

export const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: \`1px solid \${C.cardBorder}\`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

export const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: \`1px solid \${C.divider}\`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
};

export const advancedFormBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

export const sipMediaDashboardGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? "1fr"
    : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
});

export const sipMediaColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: isCompact
    ? \`16px \${SIP_MEDIA_FORM_PAD_X}px 20px\`
    : "16px 36px 20px",
  boxSizing: "border-box",
  background: C.cardBg,
});

export const sipMediaDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const sipMediaDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const sipHeaderStyle = {
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
  borderBottom: \`1px solid \${C.divider}\`,
  boxSizing: "border-box",
};

export const dashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 12,
};

export const sipMediaFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

export const valueColStyle = {
  flex: "1 1 auto",
  minWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  paddingTop: 2,
};

export const controlSlotStyle = {
  width: SIP_MEDIA_CONTROL_COL_WIDTH,
  minWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  maxWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};
`,
);

// Continue in next part of script for FormFields - read sip media constants for SECTION_HEADING_LEFT
const mediaConstants = fs.readFileSync(
  path.join(__dirname, "../src/constants/SipMediaConstants.jsx"),
  "utf8",
);
const headingLeftMatch = mediaConstants.match(
  /SIP_MEDIA_SECTION_HEADING_LEFT\s*=\s*(-?\d+)/,
);
console.log("heading left", headingLeftMatch?.[1]);
