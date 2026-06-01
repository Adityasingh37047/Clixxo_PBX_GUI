import React from "react";
import { tdStyle } from "../route/routeSharedUi";

export {
  C,
  CARD_RADIUS,
  Btn,
  TH,
  tdStyle,
  checkboxSx,
  muiSelectSx,
  muiTextFieldSx,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  numManipulatePaginationStyle,
  routeTableMinWidthForZoom,
  getBrowserZoomPercent,
} from "../route/routeSharedUi";

export const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "7px 8px",
};

export const routeThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

export const AdvancedBreadcrumb = ({ current }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
    }}
  >
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span style={{ color: "#0f172a", fontWeight: 600 }}>{current}</span>
  </div>
);

export const PortBreadcrumb = ({ segments = [], current }) => (
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
    }}
  >
    {segments.map((seg) => (
      <React.Fragment key={seg}>
        <span>{seg}</span>
        <span>&gt;</span>
      </React.Fragment>
    ))}
    <span style={{ color: "#0f172a", fontWeight: 600 }}>{current}</span>
  </div>
);

export const FieldRow = ({
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
        color: "#3E5475",
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

export const SectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
    <div style={{ borderTop: "1px solid #9CA3AF" }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#94a3b8",
      }}
    >
      {title}
    </span>
  </div>
);

export const advancedFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: "1px solid #9CA3AF",
  borderRadius: 8,
  padding: 20,
};

export const advancedFormActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "16px 24px",
  borderTop: "1px solid #9CA3AF",
  background: "#ffffff",
};

export const advancedPageWrapStyle = {
  backgroundColor: "#f8fafc",
  minHeight: "calc(100vh - 80px)",
  padding: 16,
};

export const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};
