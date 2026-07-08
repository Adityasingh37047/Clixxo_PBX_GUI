import { Tabs, Tab, useMediaQuery } from "@mui/material";
import { C } from "../../theme/pbxTokens";

const extensionPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const extensionPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const ExtensionBreadcrumb = ({ section, current, style }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
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

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const extensionModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const EXTENSION_MODAL_TAB_BAR_STYLE = {
  borderBottom: "1px solid #e5e7eb",
  background: "#ffffff",
};

const EXTENSION_MODAL_TAB_ACTIVE_COLOR = "#3E5475";
const EXTENSION_MODAL_TAB_INACTIVE_COLOR = "#374151";

const extensionModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: EXTENSION_MODAL_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: EXTENSION_MODAL_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

const ExtensionModalTabs = ({ value, onChange, tabs, fullWidth = true }) => (
  <div style={EXTENSION_MODAL_TAB_BAR_STYLE}>
    <Tabs
      value={value}
      onChange={(_, next) => onChange(next)}
      variant={fullWidth ? "fullWidth" : "standard"}
      TabIndicatorProps={{
        style: { backgroundColor: EXTENSION_MODAL_TAB_ACTIVE_COLOR, height: 2 },
      }}
      sx={extensionModalTabsSx}
    >
      {tabs.map((t) => (
        <Tab key={t.id} label={t.label} value={t.id} />
      ))}
    </Tabs>
  </div>
);

const EXTENSION_MODAL_SECTION_BG = "#f8fafc";
const EXTENSION_MODAL_SECTION_HEADING_COLOR = "#30415A";

const ExtensionModalSectionHeading = ({
  title,
  titleNode,
  isFirst = false,
  margin,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  const defaultMargin = isFirst
    ? isLaptopNarrow
      ? "16px 0 24px 0"
      : "0 0 24px 0"
    : "16px 0 24px 0";

  return (
    <div
      style={{
        margin: margin ?? defaultMargin,
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: isLaptopNarrow ? 0 : -6,
          background: EXTENSION_MODAL_SECTION_BG,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: EXTENSION_MODAL_SECTION_HEADING_COLOR,
          display: titleNode ? "inline-flex" : undefined,
          alignItems: titleNode ? "center" : undefined,
          gap: titleNode ? 0 : undefined,
        }}
      >
        {titleNode ?? title}
      </span>
    </div>
  );
};

const EXTENSION_TABLE_CARD_RADIUS = 10;

const extensionCardStyle = {
  background: "#ffffff",
  borderRadius: EXTENSION_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const extensionToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: EXTENSION_TABLE_CARD_RADIUS,
  borderTopRightRadius: EXTENSION_TABLE_CARD_RADIUS,
};

const extensionSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const extensionCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const extensionPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

export {
  extensionPageWrapStyle,
  extensionPageInnerStyle,
  ExtensionBreadcrumb,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle,
  extensionModalCancelBtnStyle,
  ExtensionModalTabs,
  extensionModalTabsSx,
  EXTENSION_MODAL_TAB_BAR_STYLE,
  EXTENSION_MODAL_TAB_ACTIVE_COLOR,
  EXTENSION_MODAL_TAB_INACTIVE_COLOR,
  EXTENSION_MODAL_SECTION_BG,
  EXTENSION_MODAL_SECTION_HEADING_COLOR,
  ExtensionModalSectionHeading,
  EXTENSION_TABLE_CARD_RADIUS,
  extensionCardStyle,
  extensionToolbarStyle,
  extensionSelectedBadgeStyle,
  extensionCancelBtnStyle,
  extensionPrimaryBtnStyle,
};
